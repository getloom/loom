import type {ActionData} from '$lib/vocab/action/action';
import {
	SignIn,
	SignOut,
	SignUp,
	UpdateAccountSettings,
	UpdateAccountPassword,
} from '$lib/vocab/account/accountActions';
import {
	CreateHub,
	ReadHub,
	UpdateHubSettings,
	DeleteHub,
	InviteToHub,
	LeaveHub,
	KickFromHub,
} from '$lib/vocab/hub/hubActions';
import {CreateAccountActor, DeletePersona} from '$lib/vocab/actor/actorActions';
import {CreateAssignment, DeleteAssignment} from '$lib/vocab/assignment/assignmentActions';
import {CreateSpace, ReadSpaces, UpdateSpace, DeleteSpace} from '$lib/vocab/space/spaceActions';
import {
	CreateEntity,
	UpdateEntities,
	ReadEntities,
	QueryEntities,
	EraseEntities,
	DeleteEntities,
	ReadEntitiesPaginated,
	ReadEntitiesById,
} from '$lib/vocab/entity/entityActions';
import {CreateRole, ReadRoles, UpdateRole, DeleteRole} from '$lib/vocab/role/roleActions';
import {
	CreatePolicy,
	ReadPolicies,
	UpdatePolicy,
	DeletePolicy,
} from '$lib/vocab/policy/policyActions';
import {
	Ping,
	Ephemera,
	SetSession,
	ToggleMainNav,
	ToggleSecondaryNav,
	SetMobile,
	OpenDialog,
	CloseDialog,
	ViewSpace,
	ClearFreshness,
} from '$lib/ui/uiActions';

export const actionDatas: ActionData[] = [
	// accountEvents
	SignUp,
	SignIn,
	SignOut,
	UpdateAccountSettings,
	UpdateAccountPassword,
	// hubEvents
	CreateHub,
	ReadHub,
	UpdateHubSettings,
	DeleteHub,
	InviteToHub,
	LeaveHub,
	KickFromHub,
	// personaEvents
	CreateAccountActor,
	DeletePersona,
	// assignmentEvents
	CreateAssignment,
	DeleteAssignment,
	// spaceEvents
	CreateSpace,
	ReadSpaces,
	UpdateSpace,
	DeleteSpace,
	// entityEvents
	CreateEntity,
	UpdateEntities,
	ReadEntities,
	ReadEntitiesPaginated,
	QueryEntities,
	EraseEntities,
	DeleteEntities,
	ReadEntitiesById,
	// roleEvents
	CreateRole,
	ReadRoles,
	UpdateRole,
	DeleteRole,
	// policyEvents
	CreatePolicy,
	ReadPolicies,
	UpdatePolicy,
	DeletePolicy,
	// uiEvents
	Ping,
	Ephemera,
	SetSession,
	ToggleMainNav,
	ToggleSecondaryNav,
	SetMobile,
	OpenDialog,
	CloseDialog,
	ViewSpace,
	ClearFreshness,
];

export const actionDataByName: Map<string, ActionData> = new Map(
	actionDatas.map((e) => [e.name, e]),
);
