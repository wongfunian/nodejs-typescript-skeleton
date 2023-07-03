import Router from 'express';
const router = Router();
import * as auth from './auth.controller';
import { staffLoginSchema } from './auth.validator';
import { resetPasswordSchema } from './auth.validator';
import { useError } from '../../../middlewares/error';

router.route('/auth/authenticate').post(useError(auth.authenticateStaff));
router.route('/auth/resetPassword').put(resetPasswordSchema, useError(auth.requestResetPassword));
router.route('/auth/resetTokenVerifier/:staffId/:token').get(useError(auth.verifyResetToken));
router.route('/auth/resetPassword/:staffId/:token').put(useError(auth.resetStaffPassword));
router.route('/auth/login').post(staffLoginSchema, useError(auth.login));
router.route('/auth/logout').post(useError(auth.logout));

router.route('/auth/tokenVerifier/:staffId/:token').get(useError(auth.verifyToken));
router.route('/auth/verify/:staffId/:token').post(useError(auth.verifyStaff));

export default router;
