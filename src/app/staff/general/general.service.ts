import prisma from '../../../utils/prisma';
import { Prisma } from '@prisma/client';

interface TableObject {
    tableName: string;
    id: string;
}

export interface ActivityLogger {
    targetId: TableObject;
    executorName: string | 'SYSTEM';
    staffId?: string;
    rtId?: string;
    action: string;
    description: string;
    reason?: string;
    data?: { [key: string]: any };
}

export const writeLogger = async ({ targetId, executorName, staffId, description, reason, action, data }: ActivityLogger) => {
    const affectedTarget = `${targetId.tableName}:${targetId.id}`;

    const writeToLogger = await prisma.activityLogs.create({
        data: {
            targetId: affectedTarget,
            executorName,
            staffId,
            description,
            action,
            reason: reason || '',
            data: data || Prisma.JsonNull,
        },
    });

    if (!writeToLogger) {
        throw {
            status: 400,
            message: 'messages:error.Failed to create activity log',
        };
    }

    return writeToLogger;
};

export const getLogs = async (targetId: string, page: number) => {
    const activityLogWhereOption: Prisma.ActivityLogsWhereInput = {
        targetId: {
            contains: targetId,
        },
    };

    const activityLog = await prisma.$transaction([
        prisma.activityLogs.count({ where: activityLogWhereOption }),
        prisma.activityLogs.findMany({
            where: activityLogWhereOption,
            take: 10,
            skip: (page - 1) * 10,
            orderBy: {
                createdAt: 'desc',
            },
        }),
    ]);

    return {
        count: activityLog[0],
        rows: activityLog[1],
    };
};
