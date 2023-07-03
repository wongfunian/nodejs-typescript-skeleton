import { NextFunction, Request, Response } from 'express';
import { passwordRegex, usernameRegex } from '../../../utils/regex';
import Joi from 'joi';

export const createStaffSchema = async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        username: Joi.string().regex(usernameRegex).required(),
        departmentId: Joi.string().required(),
        englishName: Joi.string().min(4).max(20).required(),
        chineseName: Joi.string().min(2).max(12).required(),
        nickname: Joi.string().required(),
        dateOfBirth: Joi.string().isoDate().required(),
        nationality: Joi.string().required(),
        documentNumber: Joi.string().required(),
        dateOfJoin: Joi.string().isoDate().required(),
        position: Joi.string().required(),
        directLine: Joi.string().empty('').allow(null),
        mobile1: Joi.string().required(),
        mobile2: Joi.string().empty('').allow(null),
        address: Joi.string().required(),
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

export const updateStaffSchema = async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        englishName: Joi.string().min(4).max(20).required(),
        chineseName: Joi.string().min(2).max(12).required(),
        nickname: Joi.string().required(),
        dateOfBirth: Joi.string().isoDate().required(),
        nationality: Joi.string().required(),
        documentNumber: Joi.string().required(),
        dateOfJoin: Joi.string().isoDate().required(),
        position: Joi.string().required(),
        directLine: Joi.string().empty('').allow(null),
        mobile1: Joi.string().required(),
        mobile2: Joi.string().empty('').allow(null),
        address: Joi.string().required(),
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

export const updateStaffPasswordSchema = async (req: Request, res: Response, next: NextFunction) => {
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

export const updateStaffCredentialSchema = async (req: Request, res: Response, next: NextFunction) => {
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
