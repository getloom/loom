import type {EntityData} from '$lib/vocab/entity/entityData';
import type {CreateSpaceParams} from '$lib/app/eventTypes';

// TODO where does this belong? vocab?

export interface CommunityTemplate {
	name: string;
	spaces?: SpaceTemplate[];
	// TODO roles: RoleTemplate[{name, creator, default}];
}
export interface SpaceTemplate {
	name: string;
	path?: string;
	view: string;
	icon?: string;
	entities?: EntityTemplate[];
}
export type EntityTemplate = EntityData | string; // strings are inferred as `{type: 'Note', content: value}`

export const spaceTemplateToCreateSpaceParams = (
	template: SpaceTemplate,
	actor: number,
	community_id: number,
): CreateSpaceParams => ({
	actor,
	community_id,
	name: template.name,
	path: template.path ?? '/' + template.name,
	icon: template.icon ?? '?',
	view: template.view,
});
