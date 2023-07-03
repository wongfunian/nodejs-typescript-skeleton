import { Agent } from '@prisma/client';

type AgentColumn = (keyof Agent)[];

const agentColumn: AgentColumn = [
    'id',
    'agentId',
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

const agentData = {
    exclude: (excludedColumns: AgentColumn) => {
        return agentColumn.filter((column) => !excludedColumns.includes(column));
    },
    getAll: agentColumn,
};

export default agentData;
