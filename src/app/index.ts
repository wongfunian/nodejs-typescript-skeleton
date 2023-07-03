import { Router } from 'express';
const staffRouter = Router();
const rtRouter = Router();
const publicRouter = Router();

// Staff
import staffAuth from './staff/auth/auth.route';
import staffGeneral from './staff/general/general.route';
import staff from './staff/staff/staff.route';
import client from './staff/client/client.route';
import agent from './staff/agent/agent.route';
import department from './staff/department/department.route';
import data from './staff/data/data.route';
import marketing from './staff/marketing/marketing.route';

staffRouter.use('/staff', [staffAuth, staffGeneral, staff, client, agent, department, data, marketing]);

// Public
import media from './public/media/media.route';
publicRouter.use('/', [media]);

export default [staffRouter, rtRouter, publicRouter];
