import * as service from './marketing.service';
import { Request, Response } from 'express';
import { writeLogger } from '../general/general.service';
import { Media } from '../../../types';

export const getMarketingList = async (req: Request, res: Response) => {
    /* Pagination */
    let { row, page } = req.query as any;

    let paginatedMarketingList = await service.getMarketingList(req.query as unknown as service.MarketingPaginationQuery);

    if (paginatedMarketingList.rows.length === 0 && paginatedMarketingList.count !== 0) {
        page = Math.ceil(paginatedMarketingList.count / row);

        paginatedMarketingList = await service.getMarketingList({ ...req.query, page } as unknown as service.MarketingPaginationQuery);
    }

    res.status(200).json({
        success: true,
        total: paginatedMarketingList.count,
        data: paginatedMarketingList.rows,
        page,
        message: 'messages:success.Marketing fetched',
    });
};

export const createMarketing = async (req: Request, res: Response) => {
    const { name } = req.body;
    const { englishName } = res.locals;
    console.log(req.body);

    const marketing = await service.createMarketing(name);

    await writeLogger({
        targetId: {
            id: marketing.id,
            tableName: 'marketing',
        },
        executorName: englishName,
        action: 'CREATE',
        description: 'Marketing Created',
        data: marketing,
    });

    res.status(200).json({
        success: true,
        message: res.__('marketingCreated'),
    });
};

export const getMarketing = async (req: Request, res: Response) => {
    const { marketingId } = req.params;

    const marketing = await service.getMarketing(marketingId);

    res.status(200).json({
        success: true,
        data: marketing,
        message: res.__('marketingFetched'),
    });
};

export const updateMarketingStatus = async (req: Request, res: Response) => {
    const { marketingId } = req.params;
    const { status, reason } = req.body;

    const marketing = await service.updateMarketingStatus(res, marketingId, status);

    await writeLogger({
        targetId: {
            id: marketing.id,
            tableName: 'marketing',
        },
        executorName: res.locals.englishName,
        action: 'UPDATE',
        description: status === 'active' ? 'Marketing Activated' : 'Marketing Deactivated',
        reason,
    });

    res.status(200).json({
        success: true,
        data: marketing,
        message: status === 'active' ? res.__('marketingActivated') : res.__('marketingDeactivated'),
    });
};

export const uploadMarketingBodyImage = async (req: Request, res: Response) => {
    const { marketingId } = req.params;

    const responseLocation = await service.uploadMarketingBodyImage(marketingId, req.file as Media, res.locals.englishName);

    res.status(200).json({
        success: true,
        location: responseLocation,
    });
};

export const updateMarketingTemplate = async (req: Request, res: Response) => {
    const { marketingId } = req.params;

    const marketing = await service.updateMarketingTemplate(res, marketingId, req.body);

    await writeLogger({
        targetId: {
            id: marketing.id,
            tableName: 'marketing',
        },
        executorName: res.locals.englishName,
        action: 'UPDATE',
        description: 'Marketing Template Updated',
        data: marketing,
    });

    res.status(200).json({
        success: true,
        message: res.__('marketingTemplateUpdated'),
    });
};

export const getAttachment = async (req: Request, res: Response) => {
    const { marketingId } = req.params;

    const attachment = await service.getAttachment(res, marketingId);

    res.status(200).json({
        success: true,
        data: attachment,
    });
};

export const uploadMarketingAttachment = async (req: Request, res: Response) => {
    const { marketingId } = req.params;

    const responseKey = await service.uploadMarketingAttachment(marketingId, req.file as Media, res.locals.englishName);

    res.status(200).json({
        success: true,
        data: {
            key: responseKey,
        },
    });
};
