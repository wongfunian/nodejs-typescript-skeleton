import Router from 'express';
import { isStaffAuthenticate, isAuthorize } from '../../../middlewares/auth';
import * as data from './data.controller';
import { useError } from '../../../middlewares/error';
const router = Router();

router.route('/data/department').get(isStaffAuthenticate, useError(data.getDepartmentList));
router.route('/data/staff').get(isStaffAuthenticate, useError(data.getStaffList));
export default router;
