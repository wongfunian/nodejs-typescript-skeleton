import Router from 'express';
import { isStaffAuthenticate, isAuthorize } from '../../../middlewares/auth';
import * as client from './client.controller';
import { createClientSchema, updateClientPasswordSchema, updateClientSchema, updateClientCredentialSchema } from './client.validator';
import { useError } from '../../../middlewares/error';
import { paginationSchema } from '../general/general.validator';
const router = Router();

router
    .route('/client')
    .get(isStaffAuthenticate, isAuthorize('CLIENT_VIEW'), paginationSchema, useError(client.getClientList))
    .post(isStaffAuthenticate, isAuthorize('CLIENT_CREATE'), createClientSchema, useError(client.createClient))
    .put(isStaffAuthenticate, isAuthorize('CLIENT_DELETE'), useError(client.restoreClient));

router
    .route('/client/:clientId')
    .get(isStaffAuthenticate, isAuthorize('CLIENT_VIEW'), useError(client.getClientProfile))
    .post(isStaffAuthenticate, isAuthorize('CLIENT_UPDATE'), updateClientSchema, useError(client.updateClientProfile))
    .put(isStaffAuthenticate, isAuthorize('CLIENT_UPDATE'), updateClientPasswordSchema, useError(client.updateClientPassword))
    .delete(isStaffAuthenticate, isAuthorize('CLIENT_DELETE'), useError(client.deleteClient));

router
    .route('/client/:clientId/resend-email-verification')
    .post(isStaffAuthenticate, isAuthorize('CLIENT_UPDATE'), useError(client.resendEmailVerification));
router.route('/client/:clientId/status').put(isStaffAuthenticate, isAuthorize('CLIENT_UPDATE'), useError(client.updateClientStatus));
router.route('/client/:clientId/account').post(isStaffAuthenticate, isAuthorize('CLIENT_CREDENTIAL'), useError(client.createClientAccount));
router
    .route('/client/:clientId/credential')
    .put(isStaffAuthenticate, isAuthorize('CLIENT_CREDENTIAL'), updateClientCredentialSchema, useError(client.updateClientCredential));

router
    .route('/client/:clientId/person-in-charge')
    .get(isStaffAuthenticate, isAuthorize('CLIENT_VIEW'), useError(client.getPersonInCharge))
    .post(isStaffAuthenticate, isAuthorize('CLIENT_UPDATE'), useError(client.addPersonInCharge));

router
    .route('/client/:clientId/person-in-charge/:staffId')
    .delete(isStaffAuthenticate, isAuthorize('CLIENT_UPDATE'), useError(client.removePersonInCharge));

export default router;
