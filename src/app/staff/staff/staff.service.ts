import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import EmailSender from '../../../utils/email';
import prisma, { createSelect } from '../../../utils/prisma';
import type { Prisma, Staff } from '@prisma/client';
import staffData from '../../../data/staff';
import bcrypt from 'bcryptjs';
import { PaginationQuery } from '../../../types';

export interface StaffPaginationQuery extends PaginationQuery {
    email: string;
}

export const getStaffList = async (query: StaffPaginationQuery) => {
    const { page, row, sortField, sortOrder, email } = query;

    const staffWhereOptions: Prisma.StaffWhereInput = {
        deletedAt: null,
    };

    const staffs = await prisma.$transaction([
        prisma.staff.count({
            where: staffWhereOptions,
        }),
        prisma.staff.findMany({
            take: row,
            skip: (page - 1) * row,
            orderBy: {
                [!sortField ? 'createdAt' : sortField]: sortOrder ?? 'asc',
            },
            where: staffWhereOptions,
            select: {
                ...createSelect(staffData.exclude(['password', 'token', 'resetToken', 'resetTokenExpiredAt', 'deletedAt'])),
                department: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        }),
    ]);

    return {
        count: staffs[0],
        rows: staffs[1],
    };
};

export const createStaff = async (staffId: string, staffValue: Staff) => {
    const existingUsername = await checkExistingStaffUsername(staffValue.username);
    if (existingUsername) {
        throw {
            status: 400,
            message: 'messages:error.usernameAlreadyExists',
        };
    }

    const existingEmail = await checkExistingStaffEmail(staffValue.email);
    if (existingEmail) {
        throw {
            status: 400,
            message: 'messages:error.emailAlreadyExists',
        };
    }

    const staffDetail = await prisma.staff.findFirst({
        where: {
            id: staffId,
            deletedAt: null,
        },
        select: {
            ...createSelect(['id', 'staffId']),
            department: {
                select: createSelect(['superAdmin']),
            },
        },
    });

    if (!staffDetail) {
        throw {
            status: 404,
            message: 'messages:error.staffNotFound',
        };
    }

    const department = await prisma.department.findFirst({
        select: createSelect(['superAdmin']),
        where: {
            id: staffValue.departmentId,
            deletedAt: null,
        },
    });

    if (!department) {
        throw {
            status: 404,
            message: 'messages:error.departmentNotFound',
        };
    }

    if (department['superAdmin'] && !staffDetail.department['superAdmin']) {
        throw {
            status: 403,
            message: 'messages:error.permissionDenied',
        };
    }

    const token = uuidv4();
    const staff = await prisma.staff.create({
        data: {
            ...staffValue,
            lastActive: dayjs().toDate(),
            token,
            tokenExpiredAt: dayjs().add(3, 'days').toDate(),
        },
        select: createSelect(['id', 'staffId', 'englishName']),
    });

    const emailSender = new EmailSender(staffValue.email);

    const emailResponse = await emailSender.verificationEmail({ token: token, name: staff.englishName, userId: staff.id, type: 'staff' }).send();

    if (!emailResponse.success) {
        await prisma.staff.delete({
            where: {
                id: staffId,
            },
        });
        throw {
            status: 400,
            message: 'messages:error.Email not sent',
        };
    }

    return staff;
};

export const updateStaffDepartment = async (myStaffId: string, staffId: string, departmentId: string) => {
    if (myStaffId === staffId) {
        throw {
            status: 400,
            message: 'messages:error.cannotUpdateYourself',
        };
    }

    const staffDetail = await prisma.staff.findFirst({
        where: {
            id: staffId,
            deletedAt: null,
        },
        select: {
            ...createSelect(['id', 'staffId']),
            department: {
                select: createSelect(['superAdmin']),
            },
        },
    });

    if (!staffDetail) {
        throw {
            status: 404,
            message: 'messages:error.staffNotFound',
        };
    }

    const myDetail = await prisma.staff.findFirst({
        where: {
            id: myStaffId,
            deletedAt: null,
        },
        select: {
            ...createSelect(['id', 'staffId']),
            department: {
                select: createSelect(['superAdmin']),
            },
        },
    });

    if (!myDetail) {
        throw {
            status: 404,
            message: 'messages:error.staffNotFound',
        };
    }

    const department = await prisma.department.findFirst({
        where: {
            id: departmentId,
            deletedAt: null,
        },
        select: createSelect(['id', 'name', 'superAdmin']),
    });

    if (!department) {
        throw {
            status: 404,
            message: 'messages:error.departmentNotFound',
        };
    }

    if (
        (department['superAdmin'] && !myDetail.department['superAdmin']) ||
        (!myDetail.department['superAdmin'] && staffDetail.department['superAdmin'])
    ) {
        throw {
            status: 403,
            message: 'messages:error.permissionDenied',
        };
    }

    await prisma.staff.update({
        where: {
            id: staffDetail.id,
        },
        data: {
            departmentId,
        },
    });

    return department;
};

export const deleteStaff = async (myStaffId: string, staffId: string) => {
    if (myStaffId === staffId) {
        throw {
            status: 400,
            message: 'messages:error.cannotDeleteYourself',
        };
    }
    const staffDetail = await prisma.staff.findFirst({
        where: {
            id: staffId,
            deletedAt: null,
        },
        select: {
            ...createSelect(['id', 'staffId']),
            department: {
                select: createSelect(['superAdmin']),
            },
        },
    });

    if (!staffDetail) {
        throw {
            status: 404,
            message: 'messages:error.staffNotFound',
        };
    }

    const myDetail = await prisma.staff.findFirst({
        where: {
            id: myStaffId,
            deletedAt: null,
        },
        select: {
            ...createSelect(['id', 'staffId']),
            department: {
                select: createSelect(['superAdmin']),
            },
        },
    });

    if (!myDetail) {
        throw {
            status: 404,
            message: 'messages:error.staffNotFound',
        };
    }

    if (staffDetail.department['superAdmin'] && !myDetail.department['superAdmin']) {
        throw {
            status: 403,
            message: 'messages:error.permissionDenied',
        };
    }

    await prisma.staff.update({
        where: {
            id: staffDetail.id,
        },
        data: {
            deletedAt: dayjs().toDate(),
        },
    });

    return staffDetail;
};

export const restoreStaff = async (staffId: string) => {
    const staff = await prisma.staff.findFirst({
        where: {
            id: staffId,
        },
        select: createSelect(['id']),
    });

    if (!staff) {
        throw {
            status: 404,
            message: 'messages:error.staffNotFound',
        };
    }

    await prisma.staff.update({
        where: {
            id: staff.id,
        },
        data: {
            deletedAt: null,
        },
    });

    return staff;
};

export const getStaffById = async (staffId: string) => {
    const staffColumns = staffData.exclude(['password', 'createdAt', 'updatedAt', 'deletedAt']);
    const staff = await prisma.staff.findFirst({
        where: {
            id: staffId,
            deletedAt: null,
        },
        select: createSelect(staffColumns),
    });

    if (!staff) {
        throw {
            status: 404,
            message: 'messages:error.Staff not found',
        };
    }

    return staff;
};

export const updateStaffProfile = async (myStaffId: string, staffId: string, { reason, ...body }: Staff & { reason: string }) => {
    const userDetail = await prisma.staff.findFirst({
        where: {
            id: staffId,
            deletedAt: null,
        },
        select: {
            ...createSelect(['id', 'staffId']),
            department: {
                select: createSelect(['superAdmin']),
            },
        },
    });

    if (!userDetail) {
        throw {
            status: 404,
            message: 'messages:error.staffNotFound',
        };
    }

    const myDetail = await prisma.staff.findFirst({
        where: {
            id: myStaffId,
            deletedAt: null,
        },
        select: {
            ...createSelect(['id', 'staffId']),
            department: {
                select: createSelect(['superAdmin']),
            },
        },
    });

    if (!myDetail) {
        throw {
            status: 404,
            message: 'messages:error.staffNotFound',
        };
    }

    if (!myDetail.department['superAdmin'] && userDetail.department['superAdmin']) {
        throw {
            status: 403,
            message: 'messages:error.permissionDenied',
        };
    }

    const updatedStaff = await prisma.staff.update({
        where: {
            id: userDetail.id,
        },
        data: body,
    });

    return updatedStaff;
};

export const updateUserPassword = async (myStaffId: string, staffId: string, password: string) => {
    // Super Admin cannot be deleted
    const userDetail = await prisma.staff.findFirst({
        where: {
            id: staffId,
            deletedAt: null,
        },
        select: {
            ...createSelect(['id', 'staffId']),
            department: {
                select: createSelect(['superAdmin']),
            },
        },
    });

    if (!userDetail) {
        throw {
            status: 404,
            message: 'messages:error.staffNotFound',
        };
    }

    const myDetail = await prisma.staff.findFirst({
        where: {
            id: myStaffId,
            deletedAt: null,
        },
        select: {
            ...createSelect(['id', 'staffId']),
            department: {
                select: createSelect(['superAdmin']),
            },
        },
    });

    if (!myDetail) {
        throw {
            status: 404,
            message: 'messages:error.staffNotFound',
        };
    }

    if (userDetail.department['superAdmin'] && !myDetail.department['superAdmin']) {
        throw {
            status: 403,
            message: 'messages:error.permissionDenied',
        };
    }

    var salt = bcrypt.genSaltSync(10);
    var hashedPassword = bcrypt.hashSync(password, salt);
    const updatedStaff = await prisma.staff.update({
        where: {
            id: userDetail.id,
        },
        data: {
            password: hashedPassword,
            token: null,
            tokenExpiredAt: null,
        },
    });

    return updatedStaff;
};

export const updateStaffCredential = async (staffId: string, { email, username }: { email: string; username: string }) => {
    const staff = await prisma.staff.findFirst({
        select: createSelect(['staffId', 'id', 'email', 'username']),
        where: {
            id: staffId,
            deletedAt: null,
        },
    });

    if (!staff) {
        throw {
            status: 404,
            message: 'messages:error.staffNotFound',
        };
    }

    // If updated email is different from existing, check existing staff using same updated email
    if (staff.email !== email) {
        const existingEmail = await checkExistingStaffEmail(email, staff.id);
        if (existingEmail) {
            throw {
                status: 400,
                message: 'messages:error.emailAlreadyExists',
            };
        }
    }

    // If updated username is different from existing, check existing staff using same updated username
    if (staff.username !== username) {
        const existingUsername = await checkExistingStaffUsername(username, staff.id);
        if (existingUsername) {
            throw {
                status: 400,
                message: 'messages:error.usernameAlreadyExists',
            };
        }
    }

    const updatedStaff = await prisma.staff.update({
        where: {
            id: staff.id,
        },
        data: {
            email,
            username,
        },
    });

    return staff;
};

export const changeStaffStatus = async (myStaffId: string, staffId: string, status: boolean) => {
    if (myStaffId === staffId) {
        throw {
            status: 400,
            message: 'messages:error.cannotDeactivateYourself',
        };
    }
    const userDetail = await prisma.staff.findFirst({
        where: {
            id: staffId,
            deletedAt: null,
        },
        select: {
            ...createSelect(['id', 'staffId', 'password']),
            department: {
                select: createSelect(['superAdmin']),
            },
        },
    });

    if (!userDetail) {
        throw {
            status: 404,
            message: 'messages:error.staffNotFound',
        };
    }

    if (userDetail['password'] === null) {
        throw {
            status: 400,
            message: 'messages:error.Cannot deactivate unverified user',
        };
    }

    const myDetail = await prisma.staff.findFirst({
        where: {
            id: myStaffId,
            deletedAt: null,
        },
        select: {
            ...createSelect(['id', 'staffId']),
            department: {
                select: createSelect(['superAdmin']),
            },
        },
    });

    if (!myDetail) {
        throw {
            status: 404,
            message: 'messages:error.staffNotFound',
        };
    }

    if (userDetail.department['superAdmin'] && !myDetail.department['superAdmin']) {
        throw {
            status: 403,
            message: 'messages:error.permissionDenied',
        };
    }

    const updatedStaff = await prisma.staff.update({
        where: {
            id: userDetail.id,
        },
        data: {
            active: status,
        },
        select: createSelect(['id', 'staffId', 'active']),
    });

    return updatedStaff;
};

export const resendEmailVerification = async (staffId: string) => {
    const staff = await prisma.staff.findFirst({
        where: {
            id: staffId,
            deletedAt: null,
        },
        select: createSelect(['id', 'englishName', 'email', 'token', 'tokenExpiredAt', 'staffId']),
    });

    if (!staff) {
        throw {
            status: 404,
            message: 'messages:error.Staff not found',
        };
    }

    const token = uuidv4();
    await prisma.staff.update({
        where: {
            id: staff.id,
        },
        data: {
            token,
            tokenExpiredAt: dayjs().add(3, 'days').toDate(),
        },
    });

    const emailSender = new EmailSender(staff.email);
    const emailResponse = await emailSender.verificationEmail({ token: token, name: staff.englishName, userId: staff.id, type: 'staff' }).send();

    if (!emailResponse.success) {
        throw {
            status: 400,
            message: 'messages:error.Email not sent',
        };
    }

    return staff;
};

const checkExistingStaffUsername = async (username: string, excludedId?: string) => {
    const staff = await prisma.staff.findFirst({
        where: {
            username,
            deletedAt: null,
            id: !!excludedId
                ? {
                      not: excludedId,
                  }
                : undefined,
        },
        select: createSelect(['id', 'staffId']),
    });

    if (staff) {
        return true;
    }

    return false;
};

const checkExistingStaffEmail = async (email: string, excludedId?: string) => {
    const staff = await prisma.staff.findFirst({
        where: {
            email,
            deletedAt: null,
            id: !!excludedId
                ? {
                      not: excludedId,
                  }
                : undefined,
        },
        select: createSelect(['id', 'staffId']),
    });

    if (staff) {
        return true;
    }

    return false;
};
