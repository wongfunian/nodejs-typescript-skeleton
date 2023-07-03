type UserType = 'staff' | 'client' | 'agent';

export interface VerificationEmailTypes {
    token: string;
    name: string;
    userId: string;
    type: UserType;
}

export interface PasswordResetEmailTypes {
    resetToken: string;
    name: string;
    userId: string;
    type: UserType;
}

export interface PasswordChangedEmailTypes {
    name: string;
}

export type Media = {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
};

export interface StaffJWTPayLoad {
    id: string;
    email: string;
    englishName: string;
    chineseName: string;
    departmentId: string;
}

export interface ClientJWTPayload {
    id: string;
    contactPerson: string;
}

export interface AgentJWTPayload {
    id: string;
    contactPerson: string;
}

export interface PaginationQuery {
    page: number;
    row: number;
    sortField: string | null;
    sortOrder: 'asc' | 'desc' | null;
}
