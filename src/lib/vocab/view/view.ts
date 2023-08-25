import type {Root, SvelteChild} from 'svast';
import {compile as stringifySvast} from 'svast-stringify';
import {setContext, getContext} from 'svelte';
import type {Readable} from '@feltcoop/svelte-gettable-stores';

import type {Space} from '$lib/vocab/space/space';
import type {Hub} from '$lib/vocab/hub/hub';
import type {AccountActor} from '$lib/vocab/actor/actor';
import {parseSvast} from '$lib/util/parseSvast';
import type {Directory} from '$lib/vocab//entity/entityData';
import type {VocabName} from '$lib/vocab/vocab';

export type ViewData = Root;

export type ViewNode = Root | SvelteChild; // TODO does this technically need to include `Node`?

// TODO make this a schema
export interface ViewTemplate {
	name: VocabName;
	view: string;
	icon: string;
	creatable?: boolean; // defaults to `true`
	admin?: boolean; // defaults to `false`
}

/**
 * The views available for users to create in a hub, in order of appearance.
 */
export const viewTemplates: ViewTemplate[] = [
	// special system views:
	{name: 'Home', view: '<Home />', icon: '🏠', creatable: false},
	{name: 'PersonalHome', view: '<PersonalHome />', icon: '🏠', creatable: false},
	{name: 'AdminHome', view: '<AdminHome />', icon: '🏠', creatable: false, admin: true},
	{name: 'InstanceAdmin', view: '<InstanceAdmin />', icon: '🪄', creatable: false, admin: true},
	{name: 'EntityExplorer', view: '<EntityExplorer />', icon: '✏️', creatable: false},
	// normal views:
	{name: 'Chat', view: '<Chat />', icon: '🗨'},
	{name: 'ReplyChat', view: '<ReplyChat />', icon: '↳'},
	{name: 'Board', view: '<Board />', icon: '📋'},
	{name: 'Forum', view: '<Forum />', icon: '📚'},
	{name: 'Notes', view: '<Notes />', icon: '🏷'},
	{name: 'Iframe', view: '<Iframe />', icon: '💻'}, // TODO does this need a default `src`?
	{name: 'Mural', view: '<Mural />', icon: '🎨'},
	{name: 'Todo', view: '<Todo />', icon: '🗒'},
	{name: 'List', view: '<List />', icon: '🪜'},
	{name: 'Lists', view: '<Lists />', icon: '🔨'},
];
export const viewTemplatesByName: Map<string, ViewTemplate> = new Map(
	viewTemplates.map((t) => [t.name, t]),
);

export const toCreatableViewTemplates = (
	admin: boolean,
	templates: ViewTemplate[] = viewTemplates,
): ViewTemplate[] => templates.filter((v) => v.creatable !== false && (!v.admin || admin));

/**
 * This provides security for the strategy we use to mount HTML elements from user input.
 * Allowing things like `onclick` here would enable an XSS attack.
 */
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
			const {value} = prop;
			// Allow all component props but allowlist element attributes.
			// Importantly this means component props can cause security and privacy vulnerabilities
			// depending on their usage by the component.
			if (view.type === 'svelteComponent' || allowedHtmlAttributes.has(prop.name)) {
				let str = '';
				for (const v of value) {
					if (v.type !== 'text') break;
					str += v.value;
				}
				if (str) {
					(props || (props = Object.create(null)))[prop.name] = str;
				}
			}
		}
	}
	return props;
};

export interface SpaceContext {
	actor: Readable<AccountActor>;
	hub: Readable<Hub>;
	space: Readable<Space>;
	directory: Readable<Directory>;
}

const KEY = Symbol('SpaceContext');
export const getSpaceContext = (): SpaceContext => getContext(KEY);
export const setSpaceContext = (ctx: SpaceContext): SpaceContext => setContext(KEY, ctx);

export const parseView = (value: string, generatePositions = false): ViewData =>
	parseSvast({value, generatePositions});

export const serializeView = stringifySvast;
