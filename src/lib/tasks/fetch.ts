import {Logger} from '@ryanatkn/belt/log.js';
import {blue, gray} from 'kleur/colors';
import type {Task} from '$lib/vocab/task/task';
import type {RunTaskResponseResult} from '$lib/vocab/action/actionTypes';

const log = new Logger(gray('[') + blue('siteDeploy') + gray(']'));

export class FetchTask implements Task {
	async invoke(args: string[], _dev: boolean): Promise<RunTaskResponseResult> {
		const targetSite = args[0];
		log.debug(`Calling ${targetSite}`);
		const response = await fetch(targetSite);
		const value = await response.text();

		if (response.ok) {
			return {ok: true, status: response.status, value: {message: value}};
		} else {
			return {ok: false, status: response.status, message: value};
		}
	}
}
