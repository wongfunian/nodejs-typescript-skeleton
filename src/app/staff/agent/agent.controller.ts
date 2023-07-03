import { Request, Response } from 'express';
import * as service from './agent.service';
import { writeLogger } from '../general/general.service';
import dayjs from 'dayjs';

export const getAgentList = async (req: Request, res: Response) => {
    /* Pagination */
    let { page, row } = req.query as any;

    let paginatedAgentList = await service.getAgentList(req.query as unknown as service.AgentPaginationQuery);

    if (paginatedAgentList.rows.length === 0 && paginatedAgentList.count !== 0) {
        page = Math.ceil(paginatedAgentList.count / row);

        paginatedAgentList = await service.getAgentList({ ...req.query, page } as unknown as service.AgentPaginationQuery);
    }

    res.status(200).json({
        success: true,
        total: paginatedAgentList.count,
        data: paginatedAgentList.rows,
        page,
        message: 'messages:success.Agent fetched',
    });
};

export const getAgentProfile = async (req: Request, res: Response) => {
    const { agentId } = req.params;
    const agentResponse = await service.getAgentById(agentId);

    res.status(200).json({
        success: true,
        message: 'messages:success.Agent fetched',
        data: agentResponse,
    });
};

export const createAgent = async (req: Request, res: Response) => {
    const { staffId, englishName } = res.locals;

    const createAgentResponse = await service.createAgent(req.body);

    await writeLogger({
        targetId: {
            tableName: 'agent',
            id: createAgentResponse.id,
        },
        executorName: englishName,
        staffId,
        description: 'Create agent',
        action: 'CREATE',
    });
    res.status(200).json({
        success: true,
        message: 'messages:success.Agent Created',
    });
};

export const deleteAgent = async (req: Request, res: Response) => {
    const { staffId, englishName } = res.locals;
    const { reason } = req.body;
    const agentResponse = await service.deleteAgent(req.params.agentId);

    await writeLogger({
        targetId: {
            tableName: 'agent',
            id: agentResponse.id,
        },
        executorName: englishName,
        staffId,
        description: 'Delete agent',
        action: 'DELETE',
        reason,
        data: agentResponse,
    });

    res.status(200).json({
        success: true,
        message: 'messages:success.Agent Deleted',
    });
};

export const restoreAgent = async (req: Request, res: Response) => {
    const { englishName, staffId } = res.locals;

    const agentResponse = await service.restoreAgent(req.body.agentId);

    await writeLogger({
        targetId: {
            tableName: 'agent',
            id: agentResponse.id,
        },
        executorName: englishName,
        staffId,
        description: 'Restore agent',
        action: 'RESTORE',
        reason: 'Restore agent',
        data: agentResponse,
    });

    res.status(200).json({
        success: true,
        message: 'messages:success.Agent Restored',
    });
};

export const updateAgentProfile = async (req: Request, res: Response) => {
    const { staffId, englishName } = res.locals;
    const { reason } = req.body;
    const agentResponse = await service.updateAgentProfile(req.params.agentId, req.body);

    await writeLogger({
        targetId: {
            tableName: 'agent',
            id: agentResponse.id,
        },
        executorName: englishName,
        staffId,
        description: 'Update Profile',
        action: 'UPDATE',
        reason,
        data: agentResponse,
    });

    res.status(200).json({
        success: true,
        message: 'messages:success.Updated',
    });
};

export const updateAgentPassword = async (req: Request, res: Response) => {
    const { staffId, englishName } = res.locals;
    const { reason } = req.body;
    const agentResponse = await service.updateAgentPassword(req.params.agentId, req.body.password);

    await writeLogger({
        targetId: {
            tableName: 'agent',
            id: agentResponse.id,
        },
        executorName: englishName,
        staffId,
        description: 'Update Password',
        action: 'UPDATE',
        reason,
    });

    res.status(200).json({
        success: true,
        message: 'messages:success.Agent password updated',
    });
};

export const updateAgentCredential = async (req: Request, res: Response) => {
    const { staffId, englishName } = res.locals;
    const { reason } = req.body;
    const agentResponse = await service.updateAgentCredential(req.params.agentId, req.body);

    await writeLogger({
        targetId: {
            tableName: 'agent',
            id: agentResponse.id,
        },
        executorName: englishName,
        staffId,
        description: 'Update Credential',
        action: 'UPDATE',
        reason,
    });

    res.status(200).json({
        success: true,
        message: 'messages:success.agentCredentialUpdated',
    });
};

export const updateAgentStatus = async (req: Request, res: Response) => {
    const { staffId, englishName } = res.locals;
    const { portalExpiryDate } = req.body;

    const agentResponse = await service.updateAgentStatus(req.params.agentId, portalExpiryDate);

    await writeLogger({
        targetId: {
            tableName: 'agent',
            id: agentResponse.id,
        },
        executorName: englishName,
        staffId,
        description: `update Portal Expiry Date (${portalExpiryDate ? dayjs(portalExpiryDate).format('DD MMM YYYY') : null})`,
        action: 'UPDATE',
    });

    res.status(200).json({
        success: true,
        message: 'messages:success.agentPortalExpiryDateUpdated',
    });
};

export const resendEmailVerification = async (req: Request, res: Response) => {
    const { englishName, staffId } = res.locals;
    const agentResponse = await service.resendEmailVerification(req.params.agentId);

    await writeLogger({
        targetId: {
            tableName: 'agent',
            id: agentResponse.id,
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
    const { agentId } = req.params;

    const agentResponse = await service.getPersonInCharge(agentId);

    res.status(200).json({
        success: true,
        message: 'messages:success.clientPersonInChargeFetched',
        data: agentResponse,
    });
};

export const addPersonInCharge = async (req: Request, res: Response) => {
    const { staffId, englishName } = res.locals;
    const { agentId } = req.params;

    const createdPersonInCharge = await service.addPersonInCharge(agentId, req.body.personInCharge);

    await writeLogger({
        targetId: {
            tableName: 'agent',
            id: agentId,
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
    const response = await service.removePersonInCharge(req.params.agentId, req.params.staffId);

    await writeLogger({
        targetId: {
            tableName: 'agent',
            id: response.agent.id,
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
