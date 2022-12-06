import {viewTemplates} from '$lib/vocab/view/view';
import type {CreateSpaceParams} from '$lib/app/eventTypes';
import type {Community} from '$lib/vocab/community/community';
import {ADMIN_COMMUNITY_ID} from '$lib/app/constants';

export const toDefaultSpaces = (actor: number, community: Community): CreateSpaceParams[] => {
	const {community_id, name, type} = community;
	return community_id === ADMIN_COMMUNITY_ID
		? toDefaultAdminSpaces(actor, community)
		: [
				type === 'personal'
					? {...toViewTemplateDefaults('PersonalHome'), actor, community_id, name, path: '/'}
					: {...toViewTemplateDefaults('Home'), actor, community_id, name, path: '/'},
				{...toViewTemplateDefaults('Chat'), actor, community_id, name: 'chat', path: '/chat'},
				{
					...toViewTemplateDefaults('ReplyChat'),
					actor,
					community_id,
					name: 'reply-chat',
					path: '/reply-chat',
				},
				{...toViewTemplateDefaults('Board'), actor, community_id, name: 'board', path: '/board'},
				{...toViewTemplateDefaults('Forum'), actor, community_id, name: 'forum', path: '/forum'},
				{...toViewTemplateDefaults('Notes'), actor, community_id, name: 'notes', path: '/notes'},
				{...toViewTemplateDefaults('Todo'), actor, community_id, name: 'todo', path: '/todo'},
				{...toViewTemplateDefaults('List'), actor, community_id, name: 'list', path: '/list'},
				{...toViewTemplateDefaults('Lists'), actor, community_id, name: 'lists', path: '/lists'},
		  ];
};

export const toDefaultAdminSpaces = (
	actor: number,
	{community_id, name}: Community,
): CreateSpaceParams[] => [
	{...toViewTemplateDefaults('AdminHome'), actor, community_id, name, path: '/'},
	{
		...toViewTemplateDefaults('InstanceAdmin'),
		actor,
		community_id,
		name: 'instance',
		path: '/instance',
	},
	{...toViewTemplateDefaults('Chat'), actor, community_id, name: 'chat', path: '/chat'},
];

const toViewTemplateDefaults = (name: string): {view: string; icon: string} => {
	const viewTemplate = viewTemplates.find((v) => v.name === name);
	if (!viewTemplate) throw Error(`Unable to find view template with name ${name}`);
	return {view: viewTemplate.view, icon: viewTemplate.icon};
};
