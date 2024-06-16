import {Logger} from '@ryanatkn/belt/log.js';

import {blue, gray} from '$lib/server/colors.js';
import type {ServiceByName} from '$lib/vocab/action/actionTypes.js';

import { RunTask } from '$lib/vocab/task/taskActions';
import { ADMIN_HUB_ID } from '$lib/util/constants';
import { isActorAdmin } from '../actor/actorHelpers.server';
import {execSync, spawnSync} from 'node:child_process';


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
		
        const {hub_id, task, args} = params;
		log.debug('[RunTask] hub', hub_id);		
		if (hub_id !== ADMIN_HUB_ID) return {ok: false, status: 403, message: "tasks can only be called from Admin hub"};
		
		const hub = await repos.hub.findById(hub_id);
		if (!hub) {
			return {ok: false, status: 404, message: 'no hub found'};
		}
		await checkHubAccess(hub_id);

		const commandArgs = [`tasks/${task}`].concat(args);
		if (import.meta.env.DEV) {			
			commandArgs.push('--dev');
		}		
		//2 invoke the actual named task
		//TODO add a list of "approved tasks" to mitigate user input attacks		
		const result = execSync(`gro ${commandArgs}`, {stdio: 'inherit'});
		log.warn(result.toString());
		return {ok: true, status: 200}
		
		// const result = spawnSync('gro', commandArgs);

		// //3 return invokation result & messages
		// if (result.status === 0){
		// 	log.debug(result.stdout.toString());
		// 	return {
		// 		ok: true,
		// 		status: 200,
		// 		value: {message: `${task} successfully executed`},
		// 	};
		// } else {
		// 	log.error('RunTask failed execution')
		// 	log.error(result.stderr.toJSON())
		// 	return {
		// 		ok: false,
		// 		status: 500,
		// 		message: `error executing ${task}`,
		// 	};
		// }
	},
};