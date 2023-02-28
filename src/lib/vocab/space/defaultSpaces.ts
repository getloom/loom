import {viewTemplatesByName} from '$lib/vocab/view/view';
import type {CreateSpaceParams} from '$lib/app/eventTypes';
import type {Hub} from '$lib/vocab/hub/hub';
import {ADMIN_HUB_ID} from '$lib/app/constants';
import {spaceTemplateToCreateSpaceParams} from '$lib/app/templates';

// TODO these should probably be templates not params and integrated with the default template data,
// and then callers can call `spaceTemplateToCreateSpaceParams` directly
// or we can have a separate composed helper, maybe adding the suffix `Params` to these existing functions

export const toDefaultSpaces = (actor: number, hub: Hub): CreateSpaceParams[] => {
	const {hub_id, name, type} = hub;
	return hub_id === ADMIN_HUB_ID
		? toDefaultAdminSpaces(actor, hub)
		: [
				type === 'personal'
					? {...toTemplatePartial('PersonalHome'), name, path: '/'}
					: {...toTemplatePartial('Home'), name, path: '/'},
				{...toTemplatePartial('Chat'), name: 'chat', path: '/chat'},
				{...toTemplatePartial('ReplyChat'), name: 'reply-chat', path: '/reply-chat'},
				{...toTemplatePartial('Board'), name: 'board', path: '/board'},
				{...toTemplatePartial('Forum'), name: 'forum', path: '/forum'},
				{...toTemplatePartial('Notes'), name: 'notes', path: '/notes'},
				{...toTemplatePartial('Todo'), name: 'todo', path: '/todo'},
				{...toTemplatePartial('List'), name: 'list', path: '/list'},
				{...toTemplatePartial('Lists'), name: 'lists', path: '/lists'},
		  ].map((t) => spaceTemplateToCreateSpaceParams(t, actor, hub_id));
};

export const toDefaultAdminSpaces = (actor: number, {hub_id, name}: Hub): CreateSpaceParams[] =>
	[
		{...toTemplatePartial('AdminHome'), name, path: '/'},
		{...toTemplatePartial('InstanceAdmin'), name: 'instance', path: '/instance'},
		{...toTemplatePartial('Chat'), name: 'chat', path: '/chat'},
	].map((t) => spaceTemplateToCreateSpaceParams(t, actor, hub_id));

const toTemplatePartial = (name: string): {view: string; icon: string} => {
	const viewTemplate = viewTemplatesByName.get(name);
	if (!viewTemplate) throw Error(`Unable to find view template with name ${name}`);
	return {view: viewTemplate.view, icon: viewTemplate.icon};
};
