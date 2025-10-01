import {FetchTask} from '$lib/tasks/fetch';
import {SiteDeployTask} from '$lib/tasks/siteDeploy';
import {TestTask} from '$lib/tasks/test';
import type {RunTaskResponseResult} from '$lib/vocab/action/actionTypes';

export interface Task {
	invoke: (args: string[], dev: boolean) => Promise<RunTaskResponseResult>;
}

export const tasks: Record<string, Task> = {
	fetch: new FetchTask(),
	siteDeploy: new SiteDeployTask(),
	test: new TestTask(),
};
