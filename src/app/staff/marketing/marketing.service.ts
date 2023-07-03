import { Prisma } from '@prisma/client';
import { Media, PaginationQuery } from '../../../types';
import prisma, { createSelect } from '../../../utils/prisma';
import { Response } from 'express';
import { uploadMediaToS3 } from '../../public/media/media.service';
import mediaUrl from '../../../utils/mediaUrl';

export interface MarketingPaginationQuery extends PaginationQuery {
    name: string;
}

export const getMarketingList = async (query: MarketingPaginationQuery) => {
    const { page, row, sortField, sortOrder, name } = query;

    const marketingWhereOptions: Prisma.MarketingWhereInput = {
        deletedAt: null,
        name: name
            ? {
                  contains: name,
              }
            : undefined,
    };

    const marketing = await prisma.$transaction([
        prisma.marketing.count({
            where: marketingWhereOptions,
        }),
        prisma.marketing.findMany({
            take: row,
            skip: (page - 1) * row,
            orderBy: {
                [!sortField ? 'createdAt' : sortField]: sortOrder ?? 'desc',
            },
            where: marketingWhereOptions,
            select: {
                ...createSelect(['id', 'name', 'subject', 'status']),
            },
        }),
    ]);

    return {
        count: marketing[0],
        rows: marketing[1],
    };
};

export const createMarketing = async (name: string) => {
    const marketing = await prisma.marketing.create({
        data: {
            name,
            subject: '',
            body: '',
        },
    });

    return marketing;
};

export const getMarketing = async (marketingId: string) => {
    const marketing = await prisma.marketing.findFirst({
        where: {
            id: marketingId,
        },
        select: {
            ...createSelect(['id', 'name', 'subject', 'body', 'status']),
        },
    });

    return marketing;
};

export const updateMarketingStatus = async (res: Response, marketingId: string, status: 'active' | 'inactive') => {
    const marketing = await prisma.marketing.findFirst({
        where: {
            id: marketingId,
            deletedAt: null,
        },
    });

    if (!marketing) {
        throw {
            status: 404,
            message: res.__('marketingNotFound'),
        };
    }

    await prisma.marketing.update({
        where: {
            id: marketing.id,
        },
        data: {
            status,
        },
    });

    return marketing;
};

export const uploadMarketingBodyImage = async (marketingId: string, mediaFile: Media, uploadedBy: string) => {
    //Upload Content Media to S3
    const imageFile = await uploadMediaToS3(mediaFile, {
        userType: 'staff',
        isPublic: true,
        uploadedBy: uploadedBy,
        reference_table: 'marketing',
        reference_id: marketingId,
    });

    //Create Media in DB
    const response = await prisma.media.create({
        data: imageFile,
    });

    // return Media URL in this format { location : '/your/uploaded/image/file'}
    return mediaUrl(response.key);
};

export const updateMarketingTemplate = async (res: Response, marketingId: string, body: { name: string; subject: string; body: string }) => {
    const marketing = await prisma.marketing.findFirst({
        where: {
            id: marketingId,
            deletedAt: null,
        },
    });

    if (!marketing) {
        throw {
            status: 404,
            message: res.__('marketingNotFound'),
        };
    }

    await prisma.marketing.update({
        where: {
            id: marketing.id,
        },
        data: {
            name: body.name,
            subject: body.subject,
            body: body.body,
        },
    });

    return marketing;
};

export const getAttachment = async (res: Response, marketingId: string) => {
    const marketing = await prisma.marketing.findFirst({
        where: {
            id: marketingId,
            deletedAt: null,
        },
    });

    if (!marketing) {
        throw {
            status: 404,
            message: res.__('marketingNotFound'),
        };
    }

    const attachments = await prisma.attachment.findMany({
        where: {
            marketingId,
            deletedAt: null,
        },
        select: {
            ...createSelect(['id']),
            media: {
                select: createSelect(['id', 'key', 'name']),
            },
        },
    });

    return attachments;
};

export const uploadMarketingAttachment = async (marketingId: string, mediaFile: Media, uploadedBy: string) => {
    const imageFile = await uploadMediaToS3(mediaFile, {
        userType: 'staff',
        isPublic: true,
        uploadedBy: uploadedBy,
        reference_table: 'attachment',
        reference_id: marketingId,
    });

    //Create Media in DB
    const response = await prisma.media.create({
        data: imageFile,
    });

    await prisma.attachment.create({
        data: {
            mediaId: response.id,
            marketingId,
        },
    });

    // return Media URL in this format { location : '/your/uploaded/image/file'}
    return imageFile.key;
};
