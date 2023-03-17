import type {Root, SvelteChild} from 'svast';
import {compile as stringifySvast} from 'svast-stringify';
import {setContext, getContext} from 'svelte';
import type {Readable} from '@feltcoop/svelte-gettable-stores';

import type {Space} from '$lib/vocab/space/space';
import type {Hub} from '$lib/vocab/hub/hub';
import type {AccountPersona} from '$lib/vocab/persona/persona';
import {parseSvast} from '$lib/util/parseSvast';
import type {Entity} from '$lib/vocab/entity/entity';

export type ViewData = Root;

export type ViewNode = Root | SvelteChild; // TODO does this technically need to include `Node`?

export interface ViewTemplate {
	name: string;
	view: string;
	icon: string;
	creatable?: boolean; // defaults to `true`
	admin?: boolean; // defaults to `false`
}

/**
 * The views available for users to create in a hub, in order of appearance.
 */
export const viewTemplates: ViewTemplate[] = [
	{name: 'Home', view: '<Home />', icon: '🏠', creatable: false},
	{name: 'PersonalHome', view: '<PersonalHome />', icon: '🏠', creatable: false},
	{name: 'AdminHome', view: '<AdminHome />', icon: '🏠', creatable: false, admin: true},
	{name: 'Chat', view: '<Chat />', icon: '🗨'},
	{name: 'ReplyChat', view: '<ReplyChat />', icon: '↳'},
	{name: 'Board', view: '<Board />', icon: '📋'},
	{name: 'Forum', view: '<Forum />', icon: '📚'},
	{name: 'Notes', view: '<Notes />', icon: '🏷'},
	{name: 'Iframe', view: '<Iframe />', icon: '💻'}, // TODO does this need a default `src`?
	{name: 'EntityExplorer', view: '<EntityExplorer />', icon: '✏️', creatable: false},
	{name: 'Todo', view: '<Todo />', icon: '🗒'},
	{name: 'List', view: '<List />', icon: '🪜'},
	{name: 'Lists', view: '<Lists />', icon: '🔨'},
	{name: 'InstanceAdmin', view: '<InstanceAdmin />', icon: '🪄', admin: true},
];
export const viewTemplatesByName: Map<string, ViewTemplate> = new Map(
	viewTemplates.map((t) => [t.name, t]),
);

export const toCreatableViewTemplates = (
	admin: boolean,
	templates: ViewTemplate[] = viewTemplates,
): ViewTemplate[] => templates.filter((v) => v.creatable !== false && (!v.admin || admin));

export const DEFAULT_ALLOWED_HTML_ATTRIBUTES = new Set([
	'class',
	// TODO handle external links (href/src/srcset) differently from internal ones,
	// so for example external images are not auto-embedded
	// unless the domain is allowlisted by the user
	'href',
	'src',
	'srcset',
	'alt',
	'title',
	'name',
	'width',
	'height',
]);

/**
 * Returns the props object for a Svelte component SVAST,
 * e.g. `<Foo a="A" b="B" />` returns `{a: 'A', b: 'B'}`.
 * @param view - A view's parsed SVAST
 * @returns Props object that can be splatted into a Svelte component.
 */
export const toViewProps = (
	view: ViewNode,
	allowedHtmlAttributes: Set<string> = DEFAULT_ALLOWED_HTML_ATTRIBUTES,
): Record<string, any> | undefined => {
	let props: Record<string, any> | undefined;
	if ('properties' in view) {
		for (const prop of view.properties) {
			const v = prop.value[0];
			if (
				v?.type === 'text' &&
				// Allow all component props but allowlist element attributes.
				(view.type === 'svelteComponent' || allowedHtmlAttributes.has(prop.name))
			) {
				(props || (props = {}))[prop.name] = v.value;
			}
		}
	}
	return props;
};

export interface ViewContext {
	persona: Readable<AccountPersona>;
	hub: Readable<Hub>;
	space: Readable<Space>;
	directory: Readable<Entity>;
}

const KEY = Symbol('ViewContext');
export const getViewContext = (): Readable<ViewContext> => getContext(KEY);
export const setViewContext = (ctx: Readable<ViewContext>): Readable<ViewContext> =>
	setContext(KEY, ctx);

export const parseView = (value: string, generatePositions = false): ViewData =>
	parseSvast({value, generatePositions});

export const serializeView = stringifySvast;
