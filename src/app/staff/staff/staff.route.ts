import Router from 'express';
import { isStaffAuthenticate, isAuthorize } from '../../../middlewares/auth';
import * as staff from './staff.controller';
import { createStaffSchema, updateStaffPasswordSchema, updateStaffSchema, updateStaffCredentialSchema } from './staff.validator';
import { useError } from '../../../middlewares/error';
import { paginationSchema } from '../general/general.validator';
const router = Router();

router
    .route('/staff')
    .get(isStaffAuthenticate, isAuthorize('STAFF_VIEW'), paginationSchema, useError(staff.getStaffList))
    .post(isStaffAuthenticate, isAuthorize('STAFF_CREATE'), createStaffSchema, useError(staff.createStaff))
    .put(isStaffAuthenticate, isAuthorize('STAFF_DELETE'), useError(staff.restoreStaff));

router
    .route('/staff/:staffId')
    .get(isStaffAuthenticate, isAuthorize('STAFF_VIEW'), useError(staff.getStaffProfile))
    .post(isStaffAuthenticate, isAuthorize('STAFF_UPDATE'), updateStaffSchema, useError(staff.updateStaffProfile))
    .put(isStaffAuthenticate, isAuthorize('STAFF_UPDATE'), updateStaffPasswordSchema, useError(staff.updateStaffPassword))
    .delete(isStaffAuthenticate, isAuthorize('STAFF_DELETE'), useError(staff.deleteStaff));

router.route('/staff/:staffId/department').put(isStaffAuthenticate, isAuthorize('STAFF_UPDATE'), useError(staff.updateStaffDepartment));

router
    .route('/staff/:staffId/resend-email-verification')
    .post(isStaffAuthenticate, isAuthorize('STAFF_UPDATE'), useError(staff.resendEmailVerification));
router.route('/staff/:staffId/status').put(isStaffAuthenticate, isAuthorize('STAFF_UPDATE'), useError(staff.changeStaffStatus));
router
    .route('/staff/:staffId/credential')
    .put(isStaffAuthenticate, isAuthorize('STAFF_UPDATE'), updateStaffCredentialSchema, useError(staff.updateStaffCredential));

export default router;
