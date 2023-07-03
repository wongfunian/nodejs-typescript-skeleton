import { Request, Response } from 'express';
import * as service from './department.service';
import { writeLogger } from '../general/general.service';

export const getDepartmentList = async (req: Request, res: Response) => {
    /* Pagination */
    let { row, page } = req.query as any;

    let departmentPaginationResponse = await service.getDepartmentListByPagination(req.query as unknown as service.DepartmentPaginationQuery);

    // If the data is empty and count not empty, reset the page
    if (departmentPaginationResponse.rows.length === 0 && departmentPaginationResponse.count !== 0) {
        page = Math.ceil(departmentPaginationResponse.count / row);
        departmentPaginationResponse = await service.getDepartmentListByPagination({
            ...req.query,
            page,
        } as unknown as service.DepartmentPaginationQuery);
    }
    res.status(200).json({
        success: true,
        total: departmentPaginationResponse.count,
        data: departmentPaginationResponse.rows,
        page,
        message: 'messages:success.DepartmentListByPagination fetched',
    });
};

export const getDepartment = async (req: Request, res: Response) => {
    const departmentResponse = await service.getDepartment(req.params.departmentId);

    res.status(200).json({
        success: true,
        data: departmentResponse,
        message: 'messages:success.Department fetched',
    });
};

export const createDepartment = async (req: Request, res: Response) => {
    const { englishName, staffId } = res.locals;
    const departmentResponse = await service.createDepartment(req.body);

    await writeLogger({
        targetId: {
            tableName: 'department',
            id: departmentResponse.id,
        },
        executorName: englishName,
        action: 'CREATE',
        staffId,
        description: 'Create Department',
        reason: 'Create Department',
        data: departmentResponse,
    });

    res.status(200).json({
        success: true,
        message: 'messages:success.Department successfully created',
    });
};

export const updateDepartment = async (req: Request, res: Response) => {
    const { englishName, staffId } = res.locals;
    const { reason } = req.body;
    const departmentResponse = await service.updateDepartment(req.params.departmentId, req.body);

    await writeLogger({
        targetId: {
            tableName: 'department',
            id: departmentResponse.id,
        },
        executorName: englishName,
        staffId,
        action: 'UPDATE',
        description: 'Update Department',
        reason,
        data: departmentResponse,
    });

    res.status(200).json({
        success: true,
        message: 'messages:success.Department successfully updated',
    });
};

export const deleteDepartment = async (req: Request, res: Response) => {
    const { englishName, staffId } = res.locals;
    const { reason } = req.body;
    const departmentResponse = await service.deleteDepartment(req.params.departmentId);

    await writeLogger({
        targetId: {
            tableName: 'department',
            id: departmentResponse.id,
        },
        executorName: englishName,
        action: 'DELETE',
        staffId,
        description: 'Delete Department',
        reason,
        data: departmentResponse,
    });

    res.status(200).json({
        success: true,
        message: 'messages:success.Department successfully deleted',
    });
};

export const restoreDepartment = async (req: Request, res: Response) => {
    const { englishName, staffId } = res.locals;
    const { reason } = req.body;
    const departmentResponse = await service.restoreDepartment(req.body.departmentId);

    await writeLogger({
        targetId: {
            tableName: 'department',
            id: departmentResponse.id,
        },
        executorName: englishName,
        action: 'RESTORE',
        staffId,
        description: 'Restore Department',
        reason,
        data: departmentResponse,
    });

    res.status(200).json({
        success: true,
        message: 'messages:success.Department successfully restored',
    });
};
