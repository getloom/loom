import {Logger} from '@ryanatkn/belt/log.js';

import {blue, gray} from '$lib/server/colors.js';
import type {ServiceByName} from '$lib/vocab/action/actionTypes.js';

import { RunTask } from '$lib/vocab/task/taskActions';
import { ADMIN_HUB_ID } from '$lib/util/constants';
import { isActorAdmin } from '../actor/actorHelpers.server';
import {execSync} from 'node:child_process';


const log = new Logger(gray('[') + blue('hubServices') + gray(']'));

//Executes a single installed task on behalf of an admin user.
export const RunTaskService: ServiceByName['RunTask'] = {
	action: RunTask,
	transaction: false,
	perform: async ({repos, params, account_id,actor, checkHubAccess}) => {
		log.debug('[RunTask] account', account_id);
		if (!await isActorAdmin(repos, actor.actor_id)){
			return {ok: false, status: 403, message: "only admins can call tasks"};
		}
		
        const {hub_id, task} = params;
		log.debug('[RunTask] hub', hub_id);		
		if (hub_id !== ADMIN_HUB_ID) return {ok: false, status: 403, message: "tasks can only be called from Admin hub"};
		
		const hub = await repos.hub.findById(hub_id);
		if (!hub) {
			return {ok: false, status: 404, message: 'no hub found'};
		}

		await checkHubAccess(hub_id);

		//2 invoke the actual named task
		//TODO add a list of "approved tasks" to mitigate user input attacks		
		const result = execSync(`gro tasks/${task}`);
		log.debug(result.toString());

        //3 return invokation result & messages
		return {
			ok: true,
			status: 200,
			value: {message: `${task} successfully executed`},
		};
	},
};