import {getContext, setContext, type SvelteComponent} from 'svelte';
import type {Writable} from '@feltcoop/svelte-gettable-stores';

import actor_types from '$lib/docs/actor_types.svelte';
import admin from '$lib/docs/admin.svelte';
import data_model from '$lib/docs/data_model.svelte';
import database from '$lib/docs/database.svelte';
import deploying_production from '$lib/docs/deploying_production.svelte';
import introduction from '$lib/docs/introduction.svelte';
import getting_started from '$lib/docs/getting_started.svelte';
import hub_types from '$lib/docs/hub_types.svelte';
import known_issues from '$lib/docs/known_issues.svelte';
import library_usage from '$lib/docs/library_usage.svelte';
import managing_production from '$lib/docs/managing_production.svelte';
import setup_dev_environment from '$lib/docs/setup_dev_environment.svelte';
import setup_prod_environment from '$lib/docs/setup_production.svelte';

// TODO these are eagerly loaded for UX, but we could probably
// use SvelteKit to optimize it better without issues like scroll position

interface GuideItem {
	name: string;
	slug: string;
	component: typeof SvelteComponent<any>;
}

export const userGuideItems: GuideItem[] = [
	{
		name: 'introduction',
		slug: 'user/introduction',
		component: introduction,
	},
	{
		name: 'hub types',
		slug: 'user/hub-types',
		component: hub_types,
	},
	{
		name: 'actor types',
		slug: 'user/actor-types',
		component: actor_types,
	},
	{
		name: 'known issues',
		slug: 'user/known-issues',
		component: known_issues,
	},
];

export const adminGuideItems: GuideItem[] = [
	{
		name: 'getting started',
		slug: 'admin/getting-started',
		component: getting_started,
	},
	{
		name: 'admin',
		slug: 'admin/admin',
		component: admin,
	},
	{
		name: 'database',
		slug: 'admin/database',
		component: database,
	},
	{
		name: 'setup prod environment',
		slug: 'admin/setup-production',
		component: setup_prod_environment,
	},
	{
		name: 'deploying production',
		slug: 'admin/deploying-production',
		component: deploying_production,
	},
	{
		name: 'managing production',
		slug: 'admin/managing-production',
		component: managing_production,
	},
];

export const devGuideItems: GuideItem[] = [
	{
		name: 'library usage',
		slug: 'dev/library-usage',
		component: library_usage,
	},
	{
		name: 'setup dev environment',
		slug: 'dev/setup-dev-environment',
		component: setup_dev_environment,
	},
	{
		name: 'data model',
		slug: 'dev/data-model',
		component: data_model,
	},
];

export const guideItems = userGuideItems.concat(adminGuideItems, devGuideItems);

export const guideItemsBySlug = new Map(guideItems.map((g) => [g.slug, g]));

export interface DocsSettings {
	path: string;
}
const KEY = Symbol('DocsSettings');
export const getDocsSettings = (): Writable<DocsSettings> => getContext(KEY);
export const setDocsSettings = (ctx: Writable<DocsSettings>): Writable<DocsSettings> =>
	setContext(KEY, ctx);
