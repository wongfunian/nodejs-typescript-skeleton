import Router from 'express';
import { isAuthorize, isStaffAuthenticate } from '../../../middlewares/auth';
import { useError } from '../../../middlewares/error';
import * as controller from './marketing.controller';
import { paginationSchema } from '../general/general.validator';
import multer from 'multer';
const router = Router();
const upload = multer();

router
    .route('/marketing')
    .get(isStaffAuthenticate, isAuthorize('MARKETING_VIEW'), paginationSchema, useError(controller.getMarketingList))
    .post(isStaffAuthenticate, isAuthorize('MARKETING_CREATE'), useError(controller.createMarketing));

router.route('/marketing/:marketingId').get(isStaffAuthenticate, isAuthorize('MARKETING_VIEW'), useError(controller.getMarketing));
router.route('/marketing/:marketingId/status').put(isStaffAuthenticate, isAuthorize('MARKETING_UPDATE'), useError(controller.updateMarketingStatus));

router
    .route('/marketing/:marketingId/template')
    .put(isStaffAuthenticate, isAuthorize('MARKETING_UPDATE'), useError(controller.updateMarketingTemplate));

router
    .route('/marketing/:marketingId/body-image')
    .post(isStaffAuthenticate, isAuthorize('MARKETING_UPDATE'), upload.single('file'), useError(controller.uploadMarketingBodyImage));
router
    .route('/marketing/:marketingId/attachment')
    .get(isStaffAuthenticate, isAuthorize('MARKETING_VIEW'), useError(controller.getAttachment))
    .post(isStaffAuthenticate, isAuthorize('MARKETING_UPDATE'), upload.single('file'), useError(controller.uploadMarketingAttachment));
export default router;
