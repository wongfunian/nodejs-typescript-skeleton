import { Request, Response } from 'express';
import * as service from './staff.service';
import { writeLogger } from '../general/general.service';

export const getStaffList = async (req: Request, res: Response) => {
    /* Pagination */
    let { row, page } = req.query as any;

    let paginatedStaffList = await service.getStaffList(req.query as unknown as service.StaffPaginationQuery);

    if (paginatedStaffList.rows.length === 0 && paginatedStaffList.count !== 0) {
        page = Math.ceil(paginatedStaffList.count / row);

        paginatedStaffList = await service.getStaffList({ ...req.query, page } as unknown as service.StaffPaginationQuery);
    }

    res.status(200).json({
        success: true,
        total: paginatedStaffList.count,
        data: paginatedStaffList.rows,
        page,
        message: 'messages:success.Staff fetched',
    });
};

export const getStaffProfile = async (req: Request, res: Response) => {
    const { staffId } = req.params;
    const staffResponse = await service.getStaffById(staffId);

    res.status(200).json({
        success: true,
        message: 'messages:success.Staff fetched',
        data: staffResponse,
    });
};

export const createStaff = async (req: Request, res: Response) => {
    const { staffId, englishName } = res.locals;

    const createStaffResponse = await service.createStaff(staffId, req.body);

    await writeLogger({
        targetId: {
            tableName: 'staff',
            id: createStaffResponse.id,
        },
        executorName: englishName,
        staffId,
        description: 'Create staff',
        action: 'CREATE',
    });
    res.status(200).json({
        success: true,
        message: 'messages:success.Staff Created',
    });
};

export const updateStaffDepartment = async (req: Request, res: Response) => {
    const { staffId: myStaffId, englishName } = res.locals;
    const { staffId } = req.params;
    const { departmentId } = req.body;

    const department = await service.updateStaffDepartment(myStaffId, staffId, departmentId);

    await writeLogger({
        targetId: {
            tableName: 'staff',
            id: staffId,
        },
        executorName: englishName,
        staffId,
        description: `Update department (${department.name})`,
        action: 'UPDATE',
    });

    res.status(200).json({
        success: true,
        message: 'messages:success.departmentUpdated',
    });
};

export const deleteStaff = async (req: Request, res: Response) => {
    const { staffId, englishName } = res.locals;
    const { reason } = req.body;
    const staffResponse = await service.deleteStaff(staffId, req.params.staffId);

    await writeLogger({
        targetId: {
            tableName: 'staff',
            id: staffResponse.id,
        },
        executorName: englishName,
        staffId,
        description: 'Delete staff',
        action: 'DELETE',
        reason,
        data: staffResponse,
    });

    res.status(200).json({
        success: true,
        message: 'messages:success.Staff Deleted',
    });
};

export const restoreStaff = async (req: Request, res: Response) => {
    const { englishName, staffId } = res.locals;

    const staffResponse = await service.restoreStaff(req.body.staffId);

    await writeLogger({
        targetId: {
            tableName: 'staff',
            id: staffResponse.id,
        },
        executorName: englishName,
        staffId,
        description: 'Restore staff',
        action: 'RESTORE',
        reason: 'Restore staff',
        data: staffResponse,
    });

    res.status(200).json({
        success: true,
        message: 'messages:success.Staff Restored',
    });
};

export const updateStaffProfile = async (req: Request, res: Response) => {
    const { staffId, englishName } = res.locals;
    const { reason } = req.body;
    const staffResponse = await service.updateStaffProfile(staffId, req.params.staffId, req.body);

    await writeLogger({
        targetId: {
            tableName: 'staff',
            id: staffResponse.id,
        },
        executorName: englishName,
        staffId,
        description: 'Update Profile',
        action: 'UPDATE',
        reason,
        data: staffResponse,
    });

    res.status(200).json({
        success: true,
        message: 'messages:success.Updated',
    });
};

export const updateStaffPassword = async (req: Request, res: Response) => {
    const { staffId, englishName } = res.locals;
    const { reason } = req.body;
    const staffResponse = await service.updateUserPassword(staffId, req.params.staffId, req.body.password);

    await writeLogger({
        targetId: {
            tableName: 'staff',
            id: staffResponse.id,
        },
        executorName: englishName,
        staffId,
        description: 'Update Password',
        action: 'UPDATE',
        reason,
    });

    res.status(200).json({
        success: true,
        message: 'messages:success.Staff password updated',
    });
};

export const updateStaffCredential = async (req: Request, res: Response) => {
    const { staffId, englishName } = res.locals;
    const { reason } = req.body;
    const staffResponse = await service.updateStaffCredential(req.params.staffId, req.body);

    await writeLogger({
        targetId: {
            tableName: 'staff',
            id: staffResponse.id,
        },
        executorName: englishName,
        staffId,
        description: 'Update Credential',
        action: 'UPDATE',
        reason,
    });

    res.status(200).json({
        success: true,
        message: 'messages:success.staffCredentialUpdated',
    });
};

export const changeStaffStatus = async (req: Request, res: Response) => {
    const { staffId, englishName } = res.locals;

    const staffResponse = await service.changeStaffStatus(staffId, req.params.staffId, req.body.status);

    await writeLogger({
        targetId: {
            tableName: 'staff',
            id: staffResponse.id,
        },
        executorName: englishName,
        staffId,
        description: req.body.status ? 'Activate staff' : 'Deactivate staff',
        action: 'UPDATE',
        reason: req.body.reason,
    });

    res.status(200).json({
        success: true,
        message: req.body.status ? 'messages:success.Activated' : 'messages:success.Deactivated',
    });
};

export const resendEmailVerification = async (req: Request, res: Response) => {
    const { englishName, staffId } = res.locals;
    const staffResponse = await service.resendEmailVerification(req.params.staffId);
    const pizza = 'test';

    await writeLogger({
        targetId: {
            tableName: 'staff',
            id: staffResponse.id,
        },
        executorName: englishName,
        staffId,
        description: 'Resend Email Verification',
        action: 'UPDATE',
        reason: 'Resend Email Verification',
    });

    res.status(200).json({
        success: true,
        message: 'messages:success.Email verification sent',
    });
};
