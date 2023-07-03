import Router from 'express';
import { isStaffAuthenticate, isAuthorize } from '../../../middlewares/auth';
import * as agent from './agent.controller';
import { createAgentSchema, updateAgentPasswordSchema, updateAgentSchema, updateAgentCredentialSchema } from './agent.validator';
import { useError } from '../../../middlewares/error';
import { paginationSchema } from '../general/general.validator';
const router = Router();

router
    .route('/agent')
    .get(isStaffAuthenticate, isAuthorize('AGENT_VIEW'), paginationSchema, useError(agent.getAgentList))
    .post(isStaffAuthenticate, isAuthorize('AGENT_CREATE'), createAgentSchema, useError(agent.createAgent))
    .put(isStaffAuthenticate, isAuthorize('AGENT_DELETE'), useError(agent.restoreAgent));

router
    .route('/agent/:agentId')
    .get(isStaffAuthenticate, isAuthorize('AGENT_VIEW'), useError(agent.getAgentProfile))
    .post(isStaffAuthenticate, isAuthorize('AGENT_UPDATE'), updateAgentSchema, useError(agent.updateAgentProfile))
    .put(isStaffAuthenticate, isAuthorize('AGENT_UPDATE'), updateAgentPasswordSchema, useError(agent.updateAgentPassword))
    .delete(isStaffAuthenticate, isAuthorize('AGENT_DELETE'), useError(agent.deleteAgent));

router
    .route('/agent/:agentId/resend-email-verification')
    .post(isStaffAuthenticate, isAuthorize('AGENT_UPDATE'), useError(agent.resendEmailVerification));
router.route('/agent/:agentId/status').put(isStaffAuthenticate, isAuthorize('AGENT_UPDATE'), useError(agent.updateAgentStatus));
router
    .route('/agent/:agentId/credential')
    .put(isStaffAuthenticate, isAuthorize('AGENT_UPDATE'), updateAgentCredentialSchema, useError(agent.updateAgentCredential));

router
    .route('/agent/:agentId/person-in-charge')
    .get(isStaffAuthenticate, isAuthorize('CLIENT_VIEW'), useError(agent.getPersonInCharge))
    .post(isStaffAuthenticate, isAuthorize('CLIENT_UPDATE'), useError(agent.addPersonInCharge));

router
    .route('/agent/:agentId/person-in-charge/:staffId')
    .delete(isStaffAuthenticate, isAuthorize('CLIENT_UPDATE'), useError(agent.removePersonInCharge));

export default router;
