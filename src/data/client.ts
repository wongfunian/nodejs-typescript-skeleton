import { Client } from '@prisma/client';

type ClientColumn = (keyof Client)[];

const clientColumn: ClientColumn = [
    'id',
    'clientId',
    'companyName',
    'address',
    'website',
    'industry',
    'contactPerson',
    'title',
    'mobile',
    'directLine',
    'phone',
    'email',
    'referredBy',
    'remarks',
    'username',
    'password',
    'lastActive',
    'portalExpiryDate',
    'token',
    'tokenExpiredAt',
    'resetToken',
    'resetTokenExpiredAt',
    'createdAt',
    'updatedAt',
    'deletedAt',
];

const clientData = {
    exclude: (excludedColumns: ClientColumn) => {
        return clientColumn.filter((column) => !excludedColumns.includes(column));
    },
    getAll: clientColumn,
};

export default clientData;
