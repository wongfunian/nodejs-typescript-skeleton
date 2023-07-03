import { NextFunction, Request, Response } from 'express';
import { passwordRegex, usernameRegex } from '../../../utils/regex';
import Joi from 'joi';

export const createAgentSchema = async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        username: Joi.string().regex(usernameRegex).required(),
        companyName: Joi.string().empty('').allow(null),
        website: Joi.string().empty('').allow(null),
        industry: Joi.string().empty('').allow(null),
        address: Joi.string().empty('').allow(null),
        contactPerson: Joi.string().required(),
        title: Joi.string().empty('').allow(null),
        mobile: Joi.string().empty('').allow(null),
        directLine: Joi.string().empty('').allow(null),
        phone: Joi.string().empty('').allow(null),
        referredBy: Joi.string().empty('').allow(null),
        portalExpiryDate: Joi.string().isoDate().empty('').allow(null),
        remarks: Joi.string().empty('').allow(null),
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

export const updateAgentSchema = async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        companyName: Joi.string().empty('').allow(null),
        website: Joi.string().empty('').allow(null),
        industry: Joi.string().empty('').allow(null),
        address: Joi.string().empty('').allow(null),
        contactPerson: Joi.string().required(),
        title: Joi.string().empty('').allow(null),
        mobile: Joi.string().empty('').allow(null),
        directLine: Joi.string().empty('').allow(null),
        phone: Joi.string().empty('').allow(null),
        referredBy: Joi.string().empty('').allow(null),
        portalExpiryDate: Joi.string().isoDate().empty('').allow(null),
        remarks: Joi.string().empty('').allow(null),
        reason: Joi.string().required(),
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

export const updateAgentPasswordSchema = async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        password: Joi.string().regex(passwordRegex, 'password').required(),
        confirmPassword: Joi.string().regex(passwordRegex, 'password').required(),
        reason: Joi.string().required(),
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

export const updateAgentCredentialSchema = async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        username: Joi.string().regex(usernameRegex).required(),
        reason: Joi.string().required(),
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
