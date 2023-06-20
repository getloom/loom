import {viewTemplatesByName} from '$lib/vocab/view/view';
import type {CreateSpaceParams} from '$lib/vocab/action/actionTypes';
import type {Hub} from '$lib/vocab/hub/hub';
import {ADMIN_HUB_ID} from '$lib/util/constants';
import {spaceTemplateToCreateSpaceParams} from '$lib/ui/templates';
import {HOME_PATH} from '$lib/vocab/space/spaceHelpers';
import type {ActorId} from '$lib/vocab/actor/actor';

// TODO these should probably be templates not params and integrated with the default template data,
// and then callers can call `spaceTemplateToCreateSpaceParams` directly
// or we can have a separate composed helper, maybe adding the suffix `Params` to these existing functions

export const toDefaultSpaces = (actor: ActorId, hub: Hub): CreateSpaceParams[] => {
	const {hub_id, name, type} = hub;
	return hub_id === ADMIN_HUB_ID
		? toDefaultAdminSpaces(actor, hub)
		: [
				type === 'personal'
					? {...toTemplatePartial('PersonalHome'), name, path: HOME_PATH}
					: {...toTemplatePartial('Home'), name, path: HOME_PATH},
				{...toTemplatePartial('Chat'), name: 'chat', path: '/chat'},
				{...toTemplatePartial('ReplyChat'), name: 'reply-chat', path: '/reply-chat'},
				{...toTemplatePartial('Board'), name: 'board', path: '/board'},
				{...toTemplatePartial('Forum'), name: 'forum', path: '/forum'},
				{...toTemplatePartial('Notes'), name: 'notes', path: '/notes'},
				{...toTemplatePartial('Todo'), name: 'todo', path: '/todo'},
				{...toTemplatePartial('List'), name: 'list', path: '/list'},
				{...toTemplatePartial('Lists'), name: 'lists', path: '/lists'},
				{...toTemplatePartial('Whiteboard'), name: 'whiteboard', path: '/whiteboard'},
		  ].map((t) => spaceTemplateToCreateSpaceParams(t, actor, hub_id));
};

export const toDefaultAdminSpaces = (actor: ActorId, {hub_id, name}: Hub): CreateSpaceParams[] =>
	[
		{...toTemplatePartial('AdminHome'), name, path: HOME_PATH},
		{...toTemplatePartial('InstanceAdmin'), name: 'instance', path: '/instance'},
		{...toTemplatePartial('Chat'), name: 'chat', path: '/chat'},
		{...toTemplatePartial('Whiteboard'), name: 'whiteboard', path: '/whiteboard'},
	].map((t) => spaceTemplateToCreateSpaceParams(t, actor, hub_id));

const toTemplatePartial = (name: string): {view: string; icon: string} => {
	const viewTemplate = viewTemplatesByName.get(name);
	if (!viewTemplate) throw Error(`Unable to find view template with name ${name}`);
	return {view: viewTemplate.view, icon: viewTemplate.icon};
};
