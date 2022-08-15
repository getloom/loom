import {viewTemplates} from '$lib/vocab/view/view';
import type {CreateSpaceParams} from '$lib/app/eventTypes';
import type {Community} from '$lib/vocab/community/community';

export const toDefaultSpaces = (
	persona_id: number,
	{community_id, name}: Community,
): CreateSpaceParams[] => [
	{...toViewTemplateDefaults('Home'), persona_id, community_id, name, url: '/'},
	{...toViewTemplateDefaults('Room'), persona_id, community_id, name: 'room', url: '/room'},
	{...toViewTemplateDefaults('Board'), persona_id, community_id, name: 'board', url: '/board'},
	{...toViewTemplateDefaults('Forum'), persona_id, community_id, name: 'forum', url: '/forum'},
	{...toViewTemplateDefaults('Notes'), persona_id, community_id, name: 'notes', url: '/notes'},
	{...toViewTemplateDefaults('Todo'), persona_id, community_id, name: 'todo', url: '/todo'},
];

export const toDefaultAdminSpaces = (
	persona_id: number,
	{community_id, name}: Community,
): CreateSpaceParams[] => [
	{...toViewTemplateDefaults('Home'), persona_id, community_id, name, url: '/'},
	{
		...toViewTemplateDefaults('InstanceAdmin'),
		persona_id,
		community_id,
		name: 'instance',
		url: '/instance',
	},
	{...toViewTemplateDefaults('Room'), persona_id, community_id, name: 'room', url: '/room'},
];

const toViewTemplateDefaults = (name: string): {view: string; icon: string} => {
	const viewTemplate = viewTemplates.find((v) => v.name === name);
	if (!viewTemplate) throw Error(`Unable to find view template with name ${name}`);
	return {view: viewTemplate.view, icon: viewTemplate.icon};
};
