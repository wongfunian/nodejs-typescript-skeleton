import { Request, Response } from 'express';
import { getLogs } from './general.service';
import { toNumber } from 'lodash';

export const getActivityLog = async (req: Request, res: Response) => {
    const activityLogResponse = await getLogs(req.query.targetId as string, toNumber(req.query.page));

    res.status(200).json({
        success: true,
        data: activityLogResponse.rows,
        count: activityLogResponse.count,
        message: 'messages:success.Activity log fetched',
    });
};
