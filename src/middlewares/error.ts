import { Request, Response, NextFunction } from 'express';
import { COOKIE_DOMAIN, USER_TOKEN } from '../const';
import expressWinston from 'express-winston';
import winston, { format } from 'winston';

export const useError = (fn: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// ! Do not remove "next: NextFunction" even though is not using.
// ! If remove, express.js not able to recognize this middleware is error middleware
export const globalErrorMiddleware = (error: any, req: Request, res: Response, next: NextFunction) => {
    console.log(error);

    if (error.clearStaffCookie) {
        res.clearCookie(USER_TOKEN.staff, { domain: COOKIE_DOMAIN });
    }

    if (error.clearClientCookie) {
        res.clearCookie(USER_TOKEN.client, { domain: COOKIE_DOMAIN });
    }
    if (error.clearAgentCookie) {
        res.clearCookie(USER_TOKEN.agent, { domain: COOKIE_DOMAIN });
    }

    res.status(error.status || 500).json({
        success: false,
        unauthorized: error.unauthorized ? true : undefined,
        resendEmailVerification: error.resendEmailVerification ? true : undefined,
        message: error.message,
    });
};

export const winstonErrorMiddleware = expressWinston.errorLogger({
    transports: [
        new winston.transports.File({
            filename: 'logs/error.log',
        }),
    ],
    format: format.simple(),
});
