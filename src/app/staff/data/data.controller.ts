import { Request, Response } from 'express';
import * as service from './data.service';

export const getDepartmentList = async (req: Request, res: Response) => {
    const roleList = await service.getDepartmentList(req.query);
    res.status(200).json({
        success: true,
        message: 'messages:success.departmentFetched',
        data: roleList,
    });
};

export const getStaffList = async (req: Request, res: Response) => {
    const staffList = await service.getStaffList(req.query);

    return res.status(200).json({
        success: true,
        message: 'messages:success.staffFetched',
        data: staffList,
    });
};
