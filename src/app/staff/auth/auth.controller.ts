import { Request, Response } from 'express';
import * as service from './auth.service';
import { COOKIE_OPTIONS, USER_TOKEN, COOKIE_DOMAIN } from '../../../const';
import { writeLogger } from '../general/general.service';

export const authenticateStaff = async (req: Request, res: Response) => {
    let { token, permission } = req.body;
    // Validate token and permission

    const staffResponse = await service.authenticateStaff(token, permission);

    return res.status(200).json({
        success: true,
        message: 'messages:success.Staff Authenticated',
        data: staffResponse,
    });
};

export const login = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    //Validate Staff
    const token = await service.login(username, password);

    res.cookie(USER_TOKEN.staff, token, COOKIE_OPTIONS).status(200).json({
        success: true,
        message: 'messages:success.Login success',
    });
};

export const logout = async (req: Request, res: Response) => {
    res.clearCookie(USER_TOKEN.staff, { domain: COOKIE_DOMAIN }).status(200).json({
        success: true,
        message: 'messages:success.Successfully Logged Out',
    });
};

export const verifyToken = async (req: Request, res: Response) => {
    const { token, staffId } = req.params;
    const verifyTokenResponse = await service.verifyToken(staffId, token);

    res.status(200).json({
        success: true,
        message: 'messages:success.Authentication Verified',
    });
};

export const verifyStaff = async (req: Request, res: Response) => {
    const { staffId, token } = req.params;
    const { password } = req.body;
    const response = await service.verifyStaff(password, staffId, token);

    await writeLogger({
        targetId: {
            tableName: 'staff',
            id: response.id,
        },
        executorName: 'System',
        action: 'VERIFY',
        description: 'Verify Staff',
        data: response,
    });

    res.status(200).json({
        success: true,
        message: 'messages:success.Authentication Verified',
    });
};

export const requestResetPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    const response = await service.requestResetPassword(email);

    await writeLogger({
        targetId: {
            tableName: 'staff',
            id: response.id,
        },
        executorName: 'System',
        action: 'UPDATE',
        description: 'Request reset password',
        data: response,
    });

    res.status(200).json({
        success: true,
        message: 'messages:success.Reset password link sent to your email.',
    });
};

export const verifyResetToken = async (req: Request, res: Response) => {
    const { token, staffId } = req.params;
    const verifyTokenResponse = await service.verifyResetToken(staffId, token);

    res.status(200).json({
        success: true,
        message: 'messages:success.Authentication Verified',
    });
};

export const resetStaffPassword = async (req: Request, res: Response) => {
    const { staffId, token } = req.params;
    const { password } = req.body;
    const response = await service.resetStaffPassword(password, staffId, token);

    await writeLogger({
        targetId: {
            tableName: 'staff',
            id: response.id,
        },
        executorName: 'System',
        action: 'UPDATE',
        description: 'Password reset',
        data: response,
    });

    res.status(200).json({
        success: true,
        message: 'messages:success.Verified',
    });
};
