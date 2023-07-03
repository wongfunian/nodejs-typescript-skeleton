import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

export const updateStaffSchema = async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        subject: Joi.string().required(),
        body: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
        res.status(400).json({
            success: false,
            message: error.details[0].message,
        });
    }

    next();
};
