import { Request, Response } from 'express';
import * as service from './client.service';
import { writeLogger } from '../general/general.service';
import dayjs from 'dayjs';

export const getClientList = async (req: Request, res: Response) => {
    /* Pagination */
    let { row, page } = req.query as any;

    let paginatedClientList = await service.getClientList(req.query as unknown as service.ClientPaginationQuery);

    if (paginatedClientList.rows.length === 0 && paginatedClientList.count !== 0) {
        page = Math.ceil(paginatedClientList.count / row);

        paginatedClientList = await service.getClientList({ ...req.query, page } as unknown as service.ClientPaginationQuery);
    }

    res.status(200).json({
        success: true,
        total: paginatedClientList.count,
        data: paginatedClientList.rows,
        page,
        message: 'messages:success.Client fetched',
    });
};

export const getClientProfile = async (req: Request, res: Response) => {
    const { clientId } = req.params;
    const clientResponse = await service.getClientById(clientId);

    res.status(200).json({
        success: true,
        message: 'messages:success.Client fetched',
        data: clientResponse,
    });
};

export const createClient = async (req: Request, res: Response) => {
    const { staffId, englishName } = res.locals;

    const createClientResponse = await service.createClient(req.body);

    await writeLogger({
        targetId: {
            tableName: 'client',
            id: createClientResponse.id,
        },
        executorName: englishName,
        staffId,
        description: 'Create client',
        action: 'CREATE',
    });
    res.status(200).json({
        success: true,
        message: 'messages:success.Client Created',
    });
};

export const createClientAccount = async (req: Request, res: Response) => {
    const { staffId, englishName } = res.locals;
    const { clientId: id } = req.params;

    await service.createClientAccount(id, req.body);

    await writeLogger({
        targetId: {
            tableName: 'client',
            id: id,
        },
        executorName: englishName,
        staffId,
        description: 'Create client account',
        action: 'CREATE',
        data: req.body,
    });

    res.status(200).json({
        success: true,
        message: 'messages:success.clientAccountCreated',
    });
};

export const deleteClient = async (req: Request, res: Response) => {
    const { staffId, englishName } = res.locals;
    const { reason } = req.body;
    const clientResponse = await service.deleteClient(req.params.clientId);

    await writeLogger({
        targetId: {
            tableName: 'client',
            id: clientResponse.id,
        },
        executorName: englishName,
        staffId,
        description: 'Delete client',
        action: 'DELETE',
        reason,
        data: clientResponse,
    });

    res.status(200).json({
        success: true,
        message: 'messages:success.Client Deleted',
    });
};

export const restoreClient = async (req: Request, res: Response) => {
    const { englishName, staffId } = res.locals;

    const clientResponse = await service.restoreClient(req.body.clientId);

    await writeLogger({
        targetId: {
            tableName: 'client',
            id: clientResponse.id,
        },
        executorName: englishName,
        staffId,
        description: 'Restore client',
        action: 'RESTORE',
        reason: 'Restore client',
        data: clientResponse,
    });

    res.status(200).json({
        success: true,
        message: 'messages:success.Client Restored',
    });
};

export const updateClientProfile = async (req: Request, res: Response) => {
    const { staffId, englishName } = res.locals;
    const { reason } = req.body;
    const clientResponse = await service.updateClientProfile(req.params.clientId, req.body);

    await writeLogger({
        targetId: {
            tableName: 'client',
            id: clientResponse.id,
        },
        executorName: englishName,
        staffId,
        description: 'Update Profile',
        action: 'UPDATE',
        reason,
        data: clientResponse,
    });

    res.status(200).json({
        success: true,
        message: 'messages:success.Updated',
    });
};

export const updateClientPassword = async (req: Request, res: Response) => {
    const { staffId, englishName } = res.locals;
    const { reason } = req.body;
    const clientResponse = await service.updateClientPassword(req.params.clientId, req.body.password);

    await writeLogger({
        targetId: {
            tableName: 'client',
            id: clientResponse.id,
        },
        executorName: englishName,
        staffId,
        description: 'Update Password',
        action: 'UPDATE',
        reason,
    });

    res.status(200).json({
        success: true,
        message: 'messages:success.Client password updated',
    });
};

export const updateClientCredential = async (req: Request, res: Response) => {
    const { staffId, englishName } = res.locals;
    const { reason } = req.body;
    const clientResponse = await service.updateClientCredential(req.params.clientId, req.body);

    await writeLogger({
        targetId: {
            tableName: 'client',
            id: clientResponse.id,
        },
        executorName: englishName,
        staffId,
        description: 'Update Credential',
        action: 'UPDATE',
        reason,
    });

    res.status(200).json({
        success: true,
        message: 'messages:success.clientCredentialUpdated',
    });
};

export const updateClientStatus = async (req: Request, res: Response) => {
    const { staffId, englishName } = res.locals;
    const { portalExpiryDate } = req.body;

    const clientResponse = await service.updateClientStatus(req.params.clientId, portalExpiryDate);

    await writeLogger({
        targetId: {
            tableName: 'client',
            id: clientResponse.id,
        },
        executorName: englishName,
        staffId,
        description: `update Portal Expiry Date (${portalExpiryDate ? dayjs(portalExpiryDate).format('DD MMM YYYY') : null})`,
        action: 'UPDATE',
    });

    res.status(200).json({
        success: true,
        message: 'messages:success.clientPortalExpiryDateUpdated',
    });
};

export const resendEmailVerification = async (req: Request, res: Response) => {
    const { englishName, staffId } = res.locals;
    const clientResponse = await service.resendEmailVerification(req.params.clientId);

    await writeLogger({
        targetId: {
            tableName: 'client',
            id: clientResponse.id,
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

export const getPersonInCharge = async (req: Request, res: Response) => {
    const { clientId } = req.params;

    const clientResponse = await service.getPersonInCharge(clientId);

    res.status(200).json({
        success: true,
        message: 'messages:success.clientPersonInChargeFetched',
        data: clientResponse,
    });
};

export const addPersonInCharge = async (req: Request, res: Response) => {
    const { staffId, englishName } = res.locals;
    const { clientId } = req.params;

    const createdPersonInCharge = await service.addPersonInCharge(clientId, req.body.personInCharge);

    await writeLogger({
        targetId: {
            tableName: 'client',
            id: clientId,
        },
        executorName: englishName,
        staffId,
        description: `Add Person In Charge - ${`${createdPersonInCharge.staff.englishName} (${createdPersonInCharge.staff.chineseName})`}`,
        action: 'CREATE',
        data: createdPersonInCharge,
    });

    res.status(200).json({
        success: true,
        message: 'messages:success.personInChargeAdded',
    });
};

export const removePersonInCharge = async (req: Request, res: Response) => {
    const { staffId, englishName } = res.locals;
    const { reason } = req.body;
    const response = await service.removePersonInCharge(req.params.clientId, req.params.staffId);

    await writeLogger({
        targetId: {
            tableName: 'client',
            id: response.client.id,
        },
        executorName: englishName,
        staffId,
        description: `Remove Person In Charge - ${response.staff.englishName} (${response.staff.chineseName})`,
        action: 'DELETE',
        reason,
        data: response.staff,
    });

    res.status(200).json({
        success: true,
        message: 'messages:success.personInChargeDeleted',
    });
};
