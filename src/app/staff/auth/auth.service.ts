import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import EmailSender from '../../../utils/email';
import { writeLogger } from '../general/general.service';
import prisma, { createSelect } from '../../../utils/prisma';
import departmentData from '../../../data/department';

type Decoded = {
    id: string;
    staffEmail: string;
    iat: number;
};

export const authenticateStaff = async (token: string, permission: string) => {
    // If the token cannot be verify
    const decoded: Decoded = jwt.verify(token, process.env.TOKEN_SECRET as string) as any;

    // Get the staff details
    var response = await prisma.staff.findFirst({
        where: {
            id: decoded.id,
            deletedAt: null,
        },
        select: {
            ...createSelect(['id', 'staffId', 'englishName', 'chineseName', 'email', 'nickname', 'departmentId', 'active']),
            department: {
                select: createSelect(departmentData.exclude(['createdAt', 'updatedAt', 'deletedAt', 'superAdmin'])),
            },
        },
    });

    // If staff is not exist or the staff is deleted
    if (!response) {
        throw {
            message: 'messages:error.Staff not found',
            status: 404,
            clearStaffCookie: true,
        };
    }

    await prisma.staff.update({
        where: {
            id: decoded.id,
        },
        data: {
            lastActive: new Date(),
        },
    });

    // If the staff is not active
    if (!response.active) {
        throw {
            message: 'messages:error.Staff disabled',
            status: 400,
            clearStaffCookie: true,
        };
    }

    // If the permission is valid
    if (permission !== '' && permission !== undefined && permission !== null) {
        const staff = await prisma.staff.findFirst({
            where: {
                id: decoded.id,
                deletedAt: null,
            },
            select: {
                ...createSelect(['id']),
                department: {
                    select: {
                        [permission]: true,
                    },
                },
            },
        });

        if (!staff) {
            throw {
                message: 'messages:error.unauthorized',
                unauthorized: true,
                status: 403,
            };
        }

        // If the permission is false
        if (!(staff.department as unknown as { [key: string]: boolean })[permission]) {
            throw {
                message: 'messages:error.unauthorized',
                unauthorized: true,
                status: 403,
            };
        }
    }

    return response;
};

export const login = async (username: string, password: string) => {
    const loginResponse = await prisma.staff.findFirst({
        where: {
            username,
            deletedAt: null,
        },
        select: createSelect(['id', 'staffId', 'email', 'englishName', 'chineseName', 'nickname', 'password', 'active']),
    });

    //Check if staff exists
    if (!loginResponse) {
        throw {
            status: 400,
            message: 'messages:error.Incorrect email or password',
        };
    }

    if (!loginResponse.password) {
        throw {
            status: 400,
            message: 'messages:error.Your account yet to verified',
        };
    }

    //Check if password is correct
    const isMatch = bcrypt.compareSync(password, loginResponse.password);
    if (!isMatch) {
        throw {
            status: 400,
            message: 'messages:error.Incorrect email or password',
        };
    }

    //Check if staff is active
    if (!loginResponse.active) {
        throw {
            status: 400,
            message: 'messages:error.staff is not active',
            clearStaffCookie: true,
        };
    }

    const token = jwt.sign(
        {
            id: loginResponse.id,
            chineseName: loginResponse.chineseName,
            englishName: loginResponse.englishName,
            email: loginResponse.email,
            nickname: loginResponse.nickname,
        },
        process.env.TOKEN_SECRET as string
    );

    return token;
};

export const verifyToken = async (staffId: string, token: string) => {
    const staff = await prisma.staff.findFirst({
        where: {
            id: staffId,
            deletedAt: null,
        },
        select: createSelect(['id', 'staffId', 'email', 'englishName', 'chineseName', 'token', 'tokenExpiredAt']),
    });

    if (!staff) {
        throw {
            status: 404,
            message: 'messages:error.Staff not found',
        };
    }

    if (staff.token !== token) {
        throw {
            status: 400,
            message: 'messages:error.Invalid Token',
        };
    }

    if (dayjs().isAfter(dayjs(staff.tokenExpiredAt))) {
        const token = uuidv4();
        const tokenExpiredAt = dayjs().add(3, 'days');

        const updatedStaff = await prisma.staff.update({
            where: {
                id: staff.id,
            },
            data: {
                token,
                tokenExpiredAt: tokenExpiredAt.toDate(),
            },
        });

        // Send email to staff
        const emailSender = new EmailSender(staff.email);
        await emailSender.verificationEmail({ token, name: staff.englishName, userId: staffId, type: 'staff' }).send();

        await writeLogger({
            targetId: {
                tableName: 'staff',
                id: staff.id,
            },
            executorName: 'System',
            action: 'RESEND',
            description: 'Resend Email Verification',
            data: updatedStaff,
        });

        throw {
            status: 400,
            message: 'messages:error.Token Expired, Verification email resent!',
            resendEmailVerification: true,
        };
    }
    return staff;
};

export const verifyStaff = async (password: string, staffId: string, token: string) => {
    const staff = await prisma.staff.findFirst({
        where: {
            id: staffId,
            deletedAt: null,
        },
        select: createSelect(['id', 'staffId', 'email', 'englishName', 'chineseName', 'token', 'tokenExpiredAt']),
    });

    if (!staff) {
        throw {
            status: 404,
            message: 'messages:error.Staff not found',
        };
    }

    if (staff.token !== token) {
        throw {
            status: 400,
            message: 'messages:error.Invalid Token',
        };
    }

    var salt = bcrypt.genSaltSync(10);
    var hashedPassword = bcrypt.hashSync(password, salt);

    const updatedStaff = await prisma.staff.update({
        where: {
            id: staff.id,
        },
        data: {
            token: null,
            tokenExpiredAt: null,
            password: hashedPassword,
        },
        select: createSelect(['id', 'staffId', 'email', 'englishName', 'chineseName']),
    });

    return updatedStaff;
};

export const requestResetPassword = async (email: string) => {
    const staff = await prisma.staff.findFirst({
        where: {
            email,
            deletedAt: null,
        },
        select: createSelect(['id', 'staffId', 'email', 'englishName', 'chineseName', 'tokenExpiredAt']),
    });

    if (!staff) {
        throw {
            status: 404,
            message: 'messages:error.Staff not found',
        };
    }

    if (dayjs().isAfter(dayjs(staff.tokenExpiredAt))) {
        throw {
            status: 400,
            message: 'messages:error.Token Expired',
        };
    }
    // Reset token will be expired after 1 hour using dayjs
    const resetToken = uuidv4();
    const resetTokenExpiredAt = dayjs().add(1, 'hour');

    const emailSender = new EmailSender(staff.email);
    const emailResponse = await emailSender.passwordResetEmail({ resetToken, name: staff.englishName, userId: staff.id, type: 'staff' }).send();

    if (!emailResponse.success) {
        throw {
            status: 400,
            message: 'messages:error.Failed to send the email',
        };
    }

    const updatedStaff = await prisma.staff.update({
        where: {
            id: staff.id,
        },
        data: {
            resetToken,
            resetTokenExpiredAt: resetTokenExpiredAt.toDate(),
        },
        select: createSelect(['id', 'staffId', 'email', 'englishName', 'chineseName']),
    });

    return updatedStaff;
};

export const verifyResetToken = async (staffId: string, token: string) => {
    const staff = await prisma.staff.findFirst({
        where: {
            id: staffId,
            deletedAt: null,
            resetTokenExpiredAt: {
                gt: dayjs().toDate(),
            },
        },
        select: createSelect(['id', 'staffId', 'email', 'englishName', 'chineseName', 'resetToken']),
    });

    if (!staff) {
        throw {
            status: 404,
            message: 'messages:error.Staff not found',
        };
    }

    if (staff.resetToken !== token) {
        throw {
            status: 400,
            message: 'messages:error.Invalid Token',
        };
    }

    return staff;
};

export const resetStaffPassword = async (password: string, staffId: string, resetToken: string) => {
    // If staff token is valid and not expired, update staff password
    const staff = await prisma.staff.findFirst({
        where: {
            id: staffId,
            deletedAt: null,
            resetTokenExpiredAt: {
                gt: new Date(),
            },
        },
        select: createSelect(['id', 'staffId', 'email', 'englishName', 'chineseName', 'resetToken']),
    });

    if (!staff) {
        throw {
            status: 404,
            message: 'messages:error.Staff not found',
        };
    }

    if (staff.resetToken !== resetToken) {
        throw {
            status: 400,
            message: 'messages:error.Invalid token',
        };
    }

    var salt = bcrypt.genSaltSync(10);
    var hashedPassword = bcrypt.hashSync(password, salt);
    await prisma.staff.update({
        where: {
            id: staff.id,
        },
        data: {
            resetToken: null,
            resetTokenExpiredAt: null,
            password: hashedPassword,
        },
    });

    // Send email to staff
    const emailSender = new EmailSender(staff.email);
    await emailSender.passwordChangedEmail({ name: staff.englishName }).send();

    return staff;
};
