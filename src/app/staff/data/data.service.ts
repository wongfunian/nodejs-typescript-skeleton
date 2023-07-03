import prisma, { createSelect } from '../../../utils/prisma';

export const getDepartmentList = async (query: any) => {
    const departmentResponse = await prisma.department.findMany({
        where: {
            deletedAt: null,
        },
        select: createSelect(['id', 'name']),
    });

    return departmentResponse;
};

export const getStaffList = async (query: any) => {
    let { fields } = query;

    const staffList = await prisma.staff.findMany({
        where: {
            deletedAt: null,
        },
        select: createSelect(fields && fields.length > 0 ? fields : ['id', 'staffId', 'englishName', 'chineseName']),
    });

    if (!staffList) {
        throw {
            status: 404,
            message: 'messages:error.staffNotFound',
        };
    }

    return staffList;
};
