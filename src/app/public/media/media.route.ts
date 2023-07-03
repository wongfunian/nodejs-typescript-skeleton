import Router from 'express';
const router = Router();
import * as mediaController from './media.controller';
import { useError } from '../../../middlewares/error';
import mediaAuthorizeChecker from '../../../middlewares/media';

router.route('/media/:key').get(mediaAuthorizeChecker, useError(mediaController.getMedia));
router.route('/media/download/:key').get(mediaAuthorizeChecker, useError(mediaController.downloadMedia));

export default router;
