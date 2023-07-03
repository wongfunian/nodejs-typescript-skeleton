import { Department } from '@prisma/client';

type DepartmentColumn = (keyof Department)[];

export const permissions = [
    'STAFF_VIEW',
    'STAFF_CREATE',
    'STAFF_UPDATE',
    'STAFF_DELETE',
    'DEPARTMENT_VIEW',
    'DEPARTMENT_CREATE',
    'DEPARTMENT_UPDATE',
    'DEPARTMENT_DELETE',
    'CLIENT_VIEW',
    'CLIENT_CREATE',
    'CLIENT_UPDATE',
    'CLIENT_DELETE',
    'CLIENT_CREDENTIAL',
    'AGENT_VIEW',
    'AGENT_CREATE',
    'AGENT_UPDATE',
    'AGENT_DELETE',
    'MARKETING_VIEW',
    'MARKETING_CREATE',
    'MARKETING_UPDATE',
    'MARKETING_DELETE',
    'ACTIVITY_LOG',
    'MEDIA',
] as const;

export const roleInObject = () => {
    // Assign role to object with true value
    const roleObject: any = {};
    permissions.forEach((role) => {
        roleObject[role] = true;
    });
    return roleObject;
};

const departmentColumn: DepartmentColumn = ['id', 'name', 'superAdmin', ...permissions, 'createdAt', 'updatedAt', 'deletedAt'];

const departmentData = {
    exclude: (excludedColumns: DepartmentColumn) => {
        return departmentColumn.filter((column) => !excludedColumns.includes(column));
    },
    getAll: departmentColumn,
};

export default departmentData;
