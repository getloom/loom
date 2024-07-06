import {SiteDeployTask} from '$lib/tasks/siteDeploy';
import {TestTask} from '$lib/tasks/test';
import type {Result} from '@ryanatkn/belt/result.js';

export interface Task {
	invoke: (args: string[], dev: boolean) => Promise<Result>;
}

export const tasks: Record<string, Task> = {
	siteDeploy: new SiteDeployTask(),
	test: new TestTask(),
};
