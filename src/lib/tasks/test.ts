import {Logger} from '@ryanatkn/belt/log.js';
import {blue, gray} from '$lib/server/colors.js';
import type {Result} from '@ryanatkn/belt/result.js';
import type {Task} from '$lib/vocab/task/task';

const log = new Logger(gray('[') + blue('siteDeploy') + gray(']'));

export class TestTask implements Task {
	async invoke(_args: string[], _dev: boolean): Promise<Result> {
		log.debug('hello world');
		return {ok: true};
	}
}
