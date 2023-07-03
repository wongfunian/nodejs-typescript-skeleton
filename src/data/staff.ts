import { Staff } from '@prisma/client';

type StaffColumn = (keyof Staff)[];

const staffColumn: StaffColumn = [
    'id',
    'staffId',
    'chineseName',
    'englishName',
    'nickname',
    'dateOfBirth',
    'nationality',
    'documentNumber',
    'dateOfJoin',
    'position',
    'directLine',
    'mobile1',
    'mobile2',
    'email',
    'address',
    'remarks',
    'username',
    'password',
    'lastActive',
    'active',
    'token',
    'tokenExpiredAt',
    'resetToken',
    'resetTokenExpiredAt',
    'createdAt',
    'updatedAt',
    'deletedAt',
    'departmentId',
];

const staffData = {
    exclude: (excludedColumns: StaffColumn) => {
        return staffColumn.filter((column) => !excludedColumns.includes(column));
    },
    getAll: staffColumn,
};

export default staffData;
