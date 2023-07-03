import { Media } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import authorChecker from './authorChecker';
import { USER_TOKEN } from '../../const';
import prisma, { createSelect } from '../../utils/prisma';
import jwt from 'jsonwebtoken';
import { AgentJWTPayload, ClientJWTPayload, StaffJWTPayLoad } from '../../types';
import referenceChecker from './referenceChecker';

const mediaAuthorizeChecker = async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.params;

    const media = await prisma.media.findFirst({
        where: {
            key,
            deletedAt: null,
        },
        select: createSelect(['id', 'isPublic', 'userType', 'userId', 'permission', 'reference_table', 'reference_id']),
    });

    if (!media) {
        return res.status(404).json({
            success: false,
            message: res.__('mediaNotFound'),
        });
    }

    // Public Checker
    if (media.isPublic) {
        return next();
    }

    // Author Checker
    if (media.userType && media.userId) {
        const token = req.cookies[USER_TOKEN[media.userType]];

        const isAuthor = await authorChecker(token, media.userType, media.userId);

        if (isAuthor) {
            return next();
        }
    }

    // Staff Checker
    const staffToken = req.cookies[USER_TOKEN['staff']];

    if (!staffToken) {
        return res.status(403).json({
            success: false,
            message: res.__('permissionDenied'),
        });
    }
    const staffPayload = await verifyStaff(staffToken);
    if (staffPayload) {
        const permissionSelected = ['MEDIA'];
        if (media.permission) {
            permissionSelected.push(media.permission);
        }
        const staff = await prisma.staff.findFirst({
            where: {
                id: staffPayload.id,
                deletedAt: null,
                active: true,
            },
            select: {
                ...createSelect(['id']),
                department: {
                    select: createSelect(permissionSelected),
                },
            },
        });

        if (!staff) {
            return res.status(403).json({
                success: false,
                message: res.__('permissionDenied'),
            });
        }

        // MEDIA Permission Checker
        if (staff.department['MEDIA']) {
            return next();
        }

        // Permission Checker
        if (staff.department[media.permission as string]) {
            return next();
        }
    }

    // Reference Checker
    if (media.reference_table && media.reference_id) {
        const clientToken = req.cookies[USER_TOKEN['client']];
        const agentToken = req.cookies[USER_TOKEN['agent']];
        let clientPayload = await verifyClient(clientToken);
        let agentPayload = await verifyAgent(agentToken);

        const isReference = referenceChecker.check(media.reference_table, media.reference_id, {
            staffId: staffPayload ? staffPayload.id : null,
            clientId: clientPayload ? clientPayload.id : null,
            agentId: agentPayload ? agentPayload.id : null,
        });
        if (isReference) {
            return next();
        }
    }

    return res.status(403).json({
        success: false,
        message: res.__('permissionDenied'),
    });
};

const verifyStaff = async (staffToken: string) => {
    try {
        const staffPayload = jwt.verify(staffToken, process.env.TOKEN_SECRET as string) as StaffJWTPayLoad;
        return staffPayload;
    } catch (error) {
        return null;
    }
};

const verifyClient = async (clientToken: string) => {
    try {
        const staffPayload = jwt.verify(clientToken, process.env.TOKEN_SECRET as string) as StaffJWTPayLoad;
        return staffPayload;
    } catch (error) {
        return null;
    }
};

const verifyAgent = async (agentToken: string) => {
    try {
        const staffPayload = jwt.verify(agentToken, process.env.TOKEN_SECRET as string) as StaffJWTPayLoad;
        return staffPayload;
    } catch (error) {
        return null;
    }
};

export default mediaAuthorizeChecker;
