import { NextFunction, Request, Response } from 'express';
import { permissions } from '../../../data/department';
import Joi from 'joi';

const departmentMapping = () => {
    // Assign department to object with true value
    let departmentObject: any = {};
    permissions.forEach((role) => {
        departmentObject[role] = Joi.boolean().required();
    });
    return departmentObject;
};

export const createDepartmentSchema = async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        checkAll: Joi.boolean().required(),
        ...departmentMapping(),
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

export const updateDepartmentSchema = async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        checkAll: Joi.boolean().required(),
        ...departmentMapping(),
        reason: Joi.string().required(),
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
