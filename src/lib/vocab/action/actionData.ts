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
	UpdateHub,
	DeleteHub,
	InviteToHub,
	LeaveHub,
	KickFromHub,
} from '$lib/vocab/hub/hubActions';
import {CreateAccountActor, DeleteActor} from '$lib/vocab/actor/actorActions';
import {CreateAssignment, DeleteAssignment} from '$lib/vocab/assignment/assignmentActions';
import {CreateSpace, ReadSpaces, UpdateSpace, DeleteSpace} from '$lib/vocab/space/spaceActions';
import {
	CreateEntity,
	UpdateEntities,
	EraseEntities,
	DeleteEntities,
	ReadEntities,
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

// TODO awkwardly named, but what's better? `actions` is overloaded with the client's interface to them,
// maybe `Definition` is better than `Data`?

export const actionDatas: ActionData[] = [
	// account actions
	SignUp,
	SignIn,
	SignOut,
	UpdateAccountSettings,
	UpdateAccountPassword,
	// hub actions
	CreateHub,
	ReadHub,
	UpdateHub,
	DeleteHub,
	InviteToHub,
	LeaveHub,
	KickFromHub,
	// actor actions
	CreateAccountActor,
	DeleteActor,
	// assignment actions
	CreateAssignment,
	DeleteAssignment,
	// space actions
	CreateSpace,
	ReadSpaces,
	UpdateSpace,
	DeleteSpace,
	// entity actions
	CreateEntity,
	ReadEntities,
	ReadEntitiesById,
	UpdateEntities,
	EraseEntities,
	DeleteEntities,
	// role actions
	CreateRole,
	ReadRoles,
	UpdateRole,
	DeleteRole,
	// policy actions
	CreatePolicy,
	ReadPolicies,
	UpdatePolicy,
	DeletePolicy,
	// ui actions
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
