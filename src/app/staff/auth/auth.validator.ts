import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';

export const staffLoginSchema = async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message,
        });
    }
    next();
};

export const resetPasswordSchema = async (req: Request, res: Response, next: NextFunction) => {
    const { error } = Joi.string().email().required().validate(req.body.email);

    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message,
        });
    }
    next();
};

export const requestUsernameSchema = async (req: Request, res: Response, next: NextFunction) => {
    const { error } = Joi.string().email().required().validate(req.body.email);

    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message,
        });
    }
    next();
};
