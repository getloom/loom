import {viewTemplatesByName} from '$lib/vocab/view/view.js';
import type {CreateSpaceParams} from '$lib/vocab/action/actionTypes.js';
import type {Hub} from '$lib/vocab/hub/hub.js';
import {ADMIN_HUB_ID} from '$lib/util/constants.js';
import {spaceTemplateToCreateSpaceParams} from '$lib/ui/templates.js';
import type {ActorId} from '$lib/vocab/actor/actor.js';
import {HOME_NAME} from '$lib/vocab/space/spaceHelpers.js';

// TODO these should probably be templates not params and integrated with the default template data,
// and then callers can call `spaceTemplateToCreateSpaceParams` directly
// or we can have a separate composed helper, maybe adding the suffix `Params` to these existing functions

export const toDefaultSpaces = (actor: ActorId, hub: Hub): CreateSpaceParams[] => {
	const {hub_id, type} = hub;
	return hub_id === ADMIN_HUB_ID
		? toDefaultAdminSpaces(actor, hub)
		: [
				type === 'personal'
					? {...toTemplatePartial('PersonalHome'), name: HOME_NAME}
					: {...toTemplatePartial('Home'), name: HOME_NAME},
				{...toTemplatePartial('Chat'), name: 'chat'},
				{...toTemplatePartial('ReplyChat'), name: 'reply-chat'},
				{...toTemplatePartial('Board'), name: 'board'},
				{...toTemplatePartial('Forum'), name: 'forum'},
				{...toTemplatePartial('Notes'), name: 'notes'},
				{...toTemplatePartial('Todo'), name: 'todo'},
				{...toTemplatePartial('List'), name: 'list'},
				{...toTemplatePartial('Lists'), name: 'lists'},
				{...toTemplatePartial('Mural'), name: 'mural'},
		  ].map((t) => spaceTemplateToCreateSpaceParams(t, actor, hub_id));
};

export const toDefaultAdminSpaces = (actor: ActorId, {hub_id}: Hub): CreateSpaceParams[] =>
	[
		{...toTemplatePartial('AdminHome'), name: HOME_NAME},
		{...toTemplatePartial('InstanceAdmin'), name: 'instance'},
		{...toTemplatePartial('Chat'), name: 'chat'},
		{...toTemplatePartial('Mural'), name: 'mural'},
	].map((t) => spaceTemplateToCreateSpaceParams(t, actor, hub_id));

const toTemplatePartial = (name: string): {view: string; icon: string} => {
	const viewTemplate = viewTemplatesByName.get(name);
	if (!viewTemplate) throw Error(`Unable to find view template with name ${name}`);
	return {view: viewTemplate.view, icon: viewTemplate.icon};
};
