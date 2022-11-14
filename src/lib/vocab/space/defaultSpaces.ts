import {viewTemplates} from '$lib/vocab/view/view';
import type {CreateSpaceParams} from '$lib/app/eventTypes';
import type {Community} from '$lib/vocab/community/community';

export const toDefaultSpaces = (
	actor: number,
	{community_id, name}: Community,
): CreateSpaceParams[] => [
	{...toViewTemplateDefaults('Home'), actor, community_id, name, url: '/'},
	{...toViewTemplateDefaults('Chat'), actor, community_id, name: 'chat', url: '/chat'},
	{...toViewTemplateDefaults('Board'), actor, community_id, name: 'board', url: '/board'},
	{...toViewTemplateDefaults('Forum'), actor, community_id, name: 'forum', url: '/forum'},
	{...toViewTemplateDefaults('Notes'), actor, community_id, name: 'notes', url: '/notes'},
	{...toViewTemplateDefaults('Todo'), actor, community_id, name: 'todo', url: '/todo'},
];

export const toDefaultAdminSpaces = (
	actor: number,
	{community_id, name}: Community,
): CreateSpaceParams[] => [
	{...toViewTemplateDefaults('Home'), actor, community_id, name, url: '/'},
	{
		...toViewTemplateDefaults('InstanceAdmin'),
		actor,
		community_id,
		name: 'instance',
		url: '/instance',
	},
	{...toViewTemplateDefaults('Chat'), actor, community_id, name: 'chat', url: '/chat'},
];

const toViewTemplateDefaults = (name: string): {view: string; icon: string} => {
	const viewTemplate = viewTemplates.find((v) => v.name === name);
	if (!viewTemplate) throw Error(`Unable to find view template with name ${name}`);
	return {view: viewTemplate.view, icon: viewTemplate.icon};
};
