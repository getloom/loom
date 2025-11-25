import {Logger} from '@ryanatkn/belt/log.js';
import {blue, gray} from 'kleur/colors';
import type {Task} from '$lib/vocab/task/task';
import type {RunTaskResponseResult} from '$lib/vocab/action/actionTypes';

const log = new Logger(gray('[') + blue('siteDeploy') + gray(']'));

export class TestTask implements Task {
	async invoke(_args: string[], _dev: boolean): Promise<RunTaskResponseResult> {
		log.debug('hello world');
		return {ok: true, status: 200, value: {message: 'done'}};
	}
}
