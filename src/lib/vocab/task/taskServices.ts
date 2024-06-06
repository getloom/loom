import {Logger} from '@ryanatkn/belt/log.js';

import {blue, gray} from '$lib/server/colors.js';
import type {ServiceByName} from '$lib/vocab/action/actionTypes.js';

import { RunTask } from '$lib/vocab/task/taskActions';


const log = new Logger(gray('[') + blue('hubServices') + gray(']'));

//Executes a single installed task on behalf of a user.
export const RunTaskService: ServiceByName['RunTask'] = {
	action: RunTask,
	transaction: false,
	perform: async ({repos, params, account_id, checkHubAccess}) => {
		//1Make sure someone who isn't an admin isn't calling this service from a hub that isn't admin
        const {hub_id} = params;

		log.debug('[RunTask] account', account_id); // TODO logging
		log.debug('[RunTask] hub', hub_id);

		const hub = await repos.hub.findById(hub_id);
		if (!hub) {
			return {ok: false, status: 404, message: 'no hub found'};
		}

		await checkHubAccess(hub_id);

		//2 invoke the actual named task

        //3 return invokation result & messages
		return {
			ok: true,
			status: 200,
			value: {message: "hello world"},
		};
	},
};