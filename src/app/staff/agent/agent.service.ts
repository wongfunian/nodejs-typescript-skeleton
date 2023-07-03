import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import EmailSender from '../../../utils/email';
import prisma, { createSelect } from '../../../utils/prisma';
import { Agent, Prisma } from '@prisma/client';
import agentData from '../../../data/agent';
import { PaginationQuery } from '../../../types';

export interface AgentPaginationQuery extends PaginationQuery {
    email: string;
}

export const getAgentList = async (query: AgentPaginationQuery) => {
    const { page, row, sortField, sortOrder, email } = query;

    const agentWhereOptions: Prisma.AgentWhereInput = {
        deletedAt: null,
        email: email ? { contains: email } : undefined,
    };

    const agents = await prisma.$transaction([
        prisma.agent.count({
            where: agentWhereOptions,
        }),
        prisma.agent.findMany({
            take: row,
            skip: (page - 1) * row,
            orderBy: {
                [!sortField ? 'createdAt' : sortField]: sortOrder ?? 'asc',
            },
            where: agentWhereOptions,
            select: createSelect(agentData.exclude(['password', 'token', 'resetToken', 'resetTokenExpiredAt', 'deletedAt'])),
        }),
    ]);

    return {
        count: agents[0],
        rows: agents[1],
    };
};

export const getAgentById = async (agentId: string) => {
    const agent = await prisma.agent.findFirst({
        where: {
            id: agentId,
            deletedAt: null,
        },
        select: createSelect(agentData.exclude(['password', 'createdAt', 'updatedAt', 'deletedAt'])),
    });

    if (!agent) {
        throw {
            status: 404,
            message: 'messages:error.Agent not found',
        };
    }

    return agent;
};

export const createAgent = async (agentValue: Agent) => {
    const existingUsername = await checkExistingAgentUsername(agentValue.username);
    if (existingUsername) {
        throw {
            status: 400,
            message: 'messages:error.usernameAlreadyExists',
        };
    }

    const existingEmail = await checkExistingAgentEmail(agentValue.email);
    if (existingEmail) {
        throw {
            status: 400,
            message: 'messages:error.emailAlreadyExists',
        };
    }
    const token = uuidv4();

    const agent = await prisma.agent.create({
        data: {
            ...agentValue,
            lastActive: dayjs().toDate(),
            token: token,
            tokenExpiredAt: dayjs().add(3, 'days').toDate(),
        },
    });

    const emailSender = new EmailSender(agentValue.email);

    const emailResponse = await emailSender.verificationEmail({ token: token, name: agent.username, userId: agent.id, type: 'agent' }).send();

    if (!emailResponse.success) {
        await prisma.agent.delete({
            where: {
                id: agent.id,
            },
        });
        throw {
            status: 400,
            message: 'messages:error.Email not sent',
        };
    }

    return agent;
};

export const deleteAgent = async (agentId: string) => {
    const agentDetail = await prisma.agent.findFirst({
        where: {
            id: agentId,
            deletedAt: null,
        },
        select: createSelect(['agentId', 'id']),
    });

    if (!agentDetail) {
        throw {
            status: 404,
            message: 'messages:error.agentNotFound',
        };
    }

    await prisma.agent.update({
        where: {
            id: agentId,
        },
        data: {
            deletedAt: dayjs().toDate(),
        },
    });

    return agentDetail;
};

export const restoreAgent = async (agentId: string) => {
    const agent = await prisma.agent.findFirst({
        where: {
            id: agentId,
        },
    });

    if (!agent) {
        throw {
            status: 404,
            message: 'messages:error.agentNotFound',
        };
    }

    await prisma.agent.update({
        where: {
            id: agentId,
        },
        data: {
            deletedAt: null,
        },
    });

    return agent;
};

export const updateAgentProfile = async (agentId: string, { reason, ...body }: Agent & { reason: string }) => {
    const agent = await prisma.agent.findFirst({
        select: createSelect(['agentId', 'id']),
        where: {
            id: agentId,
            deletedAt: null,
        },
    });

    if (!agent) {
        throw {
            status: 404,
            message: 'messages:error.agentNotFound',
        };
    }

    await prisma.agent.update({
        where: {
            id: agent.id,
        },
        data: body,
    });

    return agent;
};

export const updateAgentPassword = async (agentId: string, password: string) => {
    const agent = await prisma.agent.findFirst({
        select: createSelect(['agentId', 'id']),
        where: {
            id: agentId,
            deletedAt: null,
        },
    });

    if (!agent) {
        throw {
            status: 404,
            message: 'messages:error.agentNotFound',
        };
    }

    await prisma.agent.update({
        where: {
            id: agent.id,
        },
        data: {
            password,
            token: null,
            tokenExpiredAt: null,
        },
    });

    return agent;
};

export const updateAgentCredential = async (agentId: string, { email, username }: { email: string; username: string }) => {
    const agent = await prisma.agent.findFirst({
        select: createSelect(['agentId', 'id', 'email', 'username']),
        where: {
            id: agentId,
            deletedAt: null,
        },
    });

    if (!agent) {
        throw {
            status: 404,
            message: 'messages:error.agentNotFound',
        };
    }

    // If updated email is different from existing, check existing agent using same updated email
    if (agent.email !== email) {
        const existingEmail = await checkExistingAgentEmail(email, agent.id);
        if (existingEmail) {
            throw {
                status: 400,
                message: 'messages:error.emailAlreadyExists',
            };
        }
    }

    // If updated username is different from existing, check existing agent using same updated username
    if (agent.username !== username) {
        const existingUsername = await checkExistingAgentUsername(username, agent.id);
        if (existingUsername) {
            throw {
                status: 400,
                message: 'messages:error.usernameAlreadyExists',
            };
        }
    }

    await prisma.agent.update({
        where: {
            id: agent.id,
        },
        data: {
            email,
            username,
        },
    });

    return agent;
};

export const updateAgentStatus = async (agentId: string, portalExpiryDate: string | null) => {
    const agent = await prisma.agent.findFirst({
        select: createSelect(['agentId', 'id']),
        where: {
            id: agentId,
        },
    });

    if (!agent) {
        throw {
            status: 404,
            message: 'messages:error.agentNotFound',
        };
    }

    await prisma.agent.update({
        where: {
            id: agent.id,
        },
        data: {
            portalExpiryDate,
        },
    });

    return agent;
};

export const resendEmailVerification = async (agentId: string) => {
    const agent = await prisma.agent.findFirst({
        where: {
            id: agentId,
            deletedAt: null,
        },
        select: createSelect(['agentId', 'id', 'username', 'email', 'token', 'tokenExpiredAt']),
    });

    if (!agent) {
        throw {
            status: 404,
            message: 'messages:error.agentNotFound',
        };
    }

    const token = uuidv4();
    if (dayjs(agent.tokenExpiredAt) < dayjs()) {
        await prisma.agent.update({
            where: {
                id: agent.id,
            },
            data: {
                token,
                tokenExpiredAt: dayjs().add(3, 'days').toDate(),
            },
        });
    }

    const emailSender = new EmailSender(agent.email);
    const emailResponse = await emailSender.verificationEmail({ token: token, name: agent.username, userId: agent.id, type: 'agent' }).send();

    if (!emailResponse.success) {
        throw {
            status: 400,
            message: 'messages:error.emailNotSend',
        };
    }

    return agent;
};

export const getPersonInCharge = async (agentId: string) => {
    const agent = await prisma.agent.findFirst({
        where: {
            id: agentId,
            deletedAt: null,
        },
    });

    if (!agent) {
        throw {
            status: 404,
            message: 'messages:error.agentNotFound',
        };
    }

    const agentPersonInCharge = await prisma.agentPersonInCharge.findMany({
        where: {
            agentId: agent.id,
        },
        select: {
            ...createSelect(['agentId', 'staffId']),
            staff: {
                select: createSelect(['id', 'englishName', 'chineseName', 'email']),
            },
        },
    });

    return agentPersonInCharge;
};

export const addPersonInCharge = async (agentId: string, personInCharge: string) => {
    const agent = await prisma.agent.findFirst({
        where: {
            id: agentId,
            deletedAt: null,
        },
        select: createSelect(['id']),
    });

    if (!agent) {
        throw {
            status: 404,
            message: 'messages:error.agentNotFound',
        };
    }

    const createdPersonInCharge = await prisma.agentPersonInCharge.create({
        data: {
            agentId,
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

export const removePersonInCharge = async (agentId: string, staffId: string) => {
    const agent = await prisma.agent.findFirst({
        where: {
            id: agentId,
            deletedAt: null,
        },
        select: createSelect(['id']),
    });

    if (!agent) {
        throw {
            status: 404,
            message: 'messages:error.agentNotFound',
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

    await prisma.agentPersonInCharge.delete({
        where: {
            agentId_staffId: {
                agentId: agent.id,
                staffId,
            },
        },
    });

    return {
        agent,
        staff,
    };
};

const checkExistingAgentUsername = async (username: string, excludedId?: string) => {
    const agent = await prisma.agent.findFirst({
        where: {
            username,
            deletedAt: null,
            id: !!excludedId
                ? {
                      not: excludedId,
                  }
                : undefined,
        },
        select: createSelect(['id', 'agentId']),
    });

    if (agent) {
        return true;
    }

    return false;
};

const checkExistingAgentEmail = async (email: string, excludedId?: string) => {
    const agent = await prisma.agent.findFirst({
        where: {
            email,
            deletedAt: null,
            id: !!excludedId
                ? {
                      not: excludedId,
                  }
                : undefined,
        },
        select: createSelect(['id', 'agentId']),
    });

    if (agent) {
        return true;
    }

    return false;
};
