import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import EmailSender from '../../../utils/email';
import { Client, Prisma } from '@prisma/client';
import prisma, { createSelect } from '../../../utils/prisma';
import clientData from '../../../data/client';
import { PaginationQuery } from '../../../types';

export interface ClientPaginationQuery extends PaginationQuery {
    email: string;
}

export const getClientList = async (query: ClientPaginationQuery) => {
    const { page, row, sortField, sortOrder, email } = query;

    const clientWhereOptions: Prisma.ClientWhereInput = {
        deletedAt: null,
        email: email ? { contains: email } : undefined,
    };

    const clients = await prisma.$transaction([
        prisma.client.count({
            where: clientWhereOptions,
        }),
        prisma.client.findMany({
            take: row,
            skip: (page - 1) * row,
            orderBy: {
                [!sortField ? 'createdAt' : sortField]: sortOrder ?? 'asc',
            },
            where: clientWhereOptions,
            select: createSelect(clientData.exclude(['password', 'token', 'resetToken', 'resetTokenExpiredAt', 'deletedAt'])),
        }),
    ]);

    return {
        count: clients[0],
        rows: clients[1],
    };
};

export const getClientById = async (clientId: string) => {
    const client = await prisma.client.findFirst({
        where: {
            id: clientId,
            deletedAt: null,
        },
        select: createSelect(clientData.exclude(['createdAt', 'updatedAt', 'deletedAt'])),
    });

    if (!client) {
        throw {
            status: 404,
            message: 'messages:error.Client not found',
        };
    }

    return client;
};

export const createClient = async ({ createAccount, ...clientValue }: Client & { createAccount: boolean }) => {
    const isAccountCreate = createAccount;
    if (isAccountCreate) {
        const existingUsername = await checkExistingClientUsername(clientValue.username as string);
        if (existingUsername) {
            throw {
                status: 400,
                message: 'messages:error.usernameAlreadyExists',
            };
        }

        const existingEmail = await checkExistingClientEmail(clientValue.email as string);
        if (existingEmail) {
            throw {
                status: 400,
                message: 'messages:error.emailAlreadyExists',
            };
        }
    }
    const token = uuidv4();

    const client = await prisma.client.create({
        data: {
            ...clientValue,
            lastActive: isAccountCreate ? dayjs().toDate() : null,
            token: isAccountCreate ? token : null,
            tokenExpiredAt: isAccountCreate ? dayjs().add(3, 'days').toDate() : undefined,
        },
    });

    if (isAccountCreate) {
        const emailSender = new EmailSender(client.email as string);

        const emailResponse = await emailSender
            .verificationEmail({ token: token, name: client.username as string, userId: client.id, type: 'client' })
            .send();

        if (!emailResponse.success) {
            await prisma.client.delete({
                where: {
                    id: client.id,
                },
            });
            throw {
                status: 400,
                message: 'messages:error.Email not sent',
            };
        }
    }

    return client;
};

export const createClientAccount = async (
    clientId: string,
    clientAccountValue: { email: string; username: string; portalExpiryDate: string | null }
) => {
    const client = await prisma.client.findFirst({
        where: {
            id: clientId,
            deletedAt: null,
        },
        select: createSelect(['id', 'clientId', 'email', 'username']),
    });

    if (!client) {
        throw {
            status: 404,
            message: 'messages:error.clientNotFound',
        };
    }
    const existingUsername = await checkExistingClientUsername(clientAccountValue.username, client.id);
    if (existingUsername) {
        throw {
            status: 400,
            message: 'messages:error.usernameAlreadyExists',
        };
    }

    const existingEmail = await checkExistingClientEmail(clientAccountValue.email, client.id);
    if (existingEmail) {
        throw {
            status: 400,
            message: 'messages:error.emailAlreadyExists',
        };
    }

    const token = uuidv4();

    await prisma.client.update({
        where: {
            id: clientId,
        },
        data: {
            ...clientAccountValue,
            lastActive: dayjs().toDate(),
            token: token,
            tokenExpiredAt: dayjs().add(3, 'days').toDate(),
        },
    });

    const emailSender = new EmailSender(client.email as string);

    const emailResponse = await emailSender.verificationEmail({ token, name: client.username as string, userId: client.id, type: 'client' }).send();

    if (!emailResponse.success) {
        throw {
            status: 400,
            message: 'messages:error.Email not sent',
        };
    }

    return client;
};

export const deleteClient = async (clientId: string) => {
    const clientDetail = await prisma.client.findFirst({
        select: createSelect(['clientId', 'id']),
        where: {
            id: clientId,
            deletedAt: null,
        },
    });

    if (!clientDetail) {
        throw {
            status: 404,
            message: 'messages:error.clientNotFound',
        };
    }

    await prisma.client.update({
        where: {
            id: clientId,
        },
        data: {
            deletedAt: new Date(),
        },
    });

    return clientDetail;
};

export const restoreClient = async (clientId: string) => {
    const client = await prisma.client.findFirst({
        where: {
            id: clientId,
        },
    });

    if (!client) {
        throw {
            status: 404,
            message: 'messages:error.clientNotFound',
        };
    }

    await prisma.client.update({
        where: {
            id: clientId,
        },
        data: {
            deletedAt: null,
        },
    });

    return client;
};

export const updateClientProfile = async (clientId: string, { reason, ...body }: Client & { reason: string }) => {
    const client = await prisma.client.findFirst({
        select: createSelect(['clientId', 'id']),
        where: {
            id: clientId,
            deletedAt: null,
        },
    });

    if (!client) {
        throw {
            status: 404,
            message: 'messages:error.clientNotFound',
        };
    }

    await prisma.client.update({
        where: {
            id: clientId,
        },
        data: body,
    });

    return client;
};

export const updateClientPassword = async (clientId: string, password: string) => {
    const client = await prisma.client.findFirst({
        select: createSelect(['clientId', 'id']),
        where: {
            id: clientId,
            deletedAt: null,
        },
    });

    if (!client) {
        throw {
            status: 404,
            message: 'messages:error.clientNotFound',
        };
    }

    await prisma.client.update({
        where: {
            id: client.id,
        },
        data: {
            password,
            token: null,
            tokenExpiredAt: null,
        },
    });

    return client;
};

export const updateClientCredential = async (clientId: string, { email, username }: { email: string; username: string }) => {
    const client = await prisma.client.findFirst({
        select: createSelect(['clientId', 'id', 'email', 'username']),
        where: {
            id: clientId,
            deletedAt: null,
        },
    });

    if (!client) {
        throw {
            status: 404,
            message: 'messages:error.clientNotFound',
        };
    }

    // If updated email is different from existing, check existing client using same updated email
    if (client.email !== email) {
        const existingEmail = await checkExistingClientEmail(email, client.id);
        if (existingEmail) {
            throw {
                status: 400,
                message: 'messages:error.emailAlreadyExists',
            };
        }
    }

    // If updated username is different from existing, check existing client using same updated username
    if (client.username !== username) {
        const existingUsername = await checkExistingClientUsername(username, client.id);
        if (existingUsername) {
            throw {
                status: 400,
                message: 'messages:error.usernameAlreadyExists',
            };
        }
    }

    await prisma.client.update({
        where: {
            id: client.id,
        },
        data: {
            email,
            username,
        },
    });

    return client;
};

export const updateClientStatus = async (clientId: string, portalExpiryDate: string | null) => {
    const client = await prisma.client.findFirst({
        select: createSelect(['clientId', 'id']),
        where: {
            id: clientId,
            deletedAt: null,
        },
    });

    if (!client) {
        throw {
            status: 404,
            message: 'messages:error.clientNotFound',
        };
    }

    await prisma.client.update({
        where: {
            id: clientId,
        },
        data: {
            portalExpiryDate,
        },
    });

    return client;
};

export const resendEmailVerification = async (clientId: string) => {
    const client = await prisma.client.findFirst({
        where: {
            id: clientId,
            deletedAt: null,
        },
        select: createSelect(['clientId', 'id', 'username', 'email', 'token', 'tokenExpiredAt']),
    });

    if (!client) {
        throw {
            status: 404,
            message: 'messages:error.clientNotFound',
        };
    }

    const token = uuidv4();
    if (dayjs(client.tokenExpiredAt) < dayjs()) {
        await prisma.client.update({
            where: {
                id: client.id,
            },
            data: {
                token,
                tokenExpiredAt: dayjs().add(3, 'days').toDate(),
            },
        });
    }

    const emailSender = new EmailSender(client.email as string);
    const emailResponse = await emailSender
        .verificationEmail({ token: token, name: client.username as string, userId: client.id, type: 'client' })
        .send();

    if (!emailResponse.success) {
        throw {
            status: 400,
            message: 'messages:error.emailNotSend',
        };
    }

    return client;
};

export const getPersonInCharge = async (clientId: string) => {
    const client = await prisma.client.findFirst({
        where: {
            id: clientId,
            deletedAt: null,
        },
    });

    if (!client) {
        throw {
            status: 404,
            message: 'messages:error.clientNotFound',
        };
    }

    const clientPersonInCharge = await prisma.clientPersonInCharge.findMany({
        where: {
            clientId: client.id,
        },
        select: {
            ...createSelect(['clientId', 'staffId']),
            staff: {
                select: createSelect(['id', 'englishName', 'chineseName', 'email']),
            },
        },
    });

    return clientPersonInCharge;
};

export const addPersonInCharge = async (clientId: string, personInCharge: string) => {
    const client = await prisma.client.findFirst({
        where: {
            id: clientId,
            deletedAt: null,
        },
        select: createSelect(['id']),
    });

    if (!client) {
        throw {
            status: 404,
            message: 'messages:error.clientNotFound',
        };
    }

    const createdPersonInCharge = await prisma.clientPersonInCharge.create({
        data: {
            clientId,
            staffId: personInCharge,
        },
        select: {
            staff: {
                select: createSelect(['id', 'englishName', 'chineseName']),
            },
        },
    });

    return createdPersonInCharge;
};

export const removePersonInCharge = async (clientId: string, staffId: string) => {
    const client = await prisma.client.findFirst({
        where: {
            id: clientId,
            deletedAt: null,
        },
        select: createSelect(['id']),
    });

    if (!client) {
        throw {
            status: 404,
            message: 'messages:error.clientNotFound',
        };
    }

    const staff = await prisma.staff.findFirst({
        where: {
            id: staffId,
            deletedAt: null,
        },
        select: createSelect(['id', 'englishName', 'chineseName']),
    });

    if (!staff) {
        throw {
            status: 404,
            message: 'messages:error.staffNotFound',
        };
    }

    await prisma.clientPersonInCharge.delete({
        where: {
            clientId_staffId: {
                clientId: client.id,
                staffId,
            },
        },
    });

    return {
        client,
        staff,
    };
};

const checkExistingClientUsername = async (username: string, excludedId?: string) => {
    const client = await prisma.client.findFirst({
        where: {
            username,
            deletedAt: null,
            id: !!excludedId
                ? {
                      not: excludedId,
                  }
                : undefined,
        },
        select: createSelect(['id', 'clientId']),
    });

    if (client) {
        return true;
    }

    return false;
};

const checkExistingClientEmail = async (email: string, excludedId?: string) => {
    const client = await prisma.client.findFirst({
        where: {
            email,
            deletedAt: null,
            id: !!excludedId
                ? {
                      not: excludedId,
                  }
                : undefined,
        },
        select: createSelect(['id', 'clientId']),
    });

    if (client) {
        return true;
    }

    return false;
};
