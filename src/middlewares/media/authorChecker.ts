import { UserType } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { AgentJWTPayload, StaffJWTPayLoad, ClientJWTPayload } from '../../types';
import prisma from '../../utils/prisma';

const authorChecker = async (token: string, userType: UserType, mediaAuthorId: string) => {
    type UserPayload<T extends UserType> = T extends 'staff' ? StaffJWTPayLoad : T extends 'client' ? ClientJWTPayload : AgentJWTPayload;

    const payload = jwt.verify(token, process.env.TOKEN_SECRET as string) as UserPayload<typeof userType>;

    if (!payload) {
        return false;
    }

    if (payload.id === mediaAuthorId) {
        return true;
    }

    return false;
};

export default authorChecker;
