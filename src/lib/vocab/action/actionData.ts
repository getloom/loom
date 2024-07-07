import type {ActionData} from '$lib/vocab/action/action.js';
import {
	SignIn,
	SignOut,
	SignUp,
	UpdateAccountSettings,
	UpdateAccountPassword,
} from '$lib/vocab/account/accountActions.js';
import {
	CreateHub,
	ReadHub,
	UpdateHub,
	DeleteHub,
	InviteToHub,
	LeaveHub,
	KickFromHub,
} from '$lib/vocab/hub/hubActions.js';
import {CreateAccountActor, DeleteActor} from '$lib/vocab/actor/actorActions.js';
import {CreateAssignment, DeleteAssignment} from '$lib/vocab/assignment/assignmentActions.js';
import {CreateSpace, ReadSpaces, UpdateSpace, DeleteSpace} from '$lib/vocab/space/spaceActions.js';
import {
	CreateEntity,
	UpdateEntities,
	EraseEntities,
	DeleteEntities,
	ReadEntities,
	ReadEntitiesById,
} from '$lib/vocab/entity/entityActions.js';
import {CreateRole, ReadRoles, UpdateRole, DeleteRole} from '$lib/vocab/role/roleActions.js';
import {
	CreatePolicy,
	ReadPolicies,
	UpdatePolicy,
	DeletePolicy,
} from '$lib/vocab/policy/policyActions.js';
import {RunTask} from '$lib/vocab/task/taskActions.js';
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
} from '$lib/ui/uiActions.js';

// TODO awkwardly named, but what's better? `actions` is overloaded with the client's interface to them,
// maybe `Definition` is better than `Data`?

export const actionDatas: ActionData[] = [
	ClearFreshness,
	CloseDialog,
	CreateAccountActor,
	CreateAssignment,
	CreateEntity,
	CreateHub,
	CreatePolicy,
	CreateRole,
	CreateSpace,
	DeleteActor,
	DeleteAssignment,
	DeleteEntities,
	DeleteHub,
	DeletePolicy,
	DeleteRole,
	DeleteSpace,
	Ephemera,
	EraseEntities,
	InviteToHub,
	KickFromHub,
	LeaveHub,
	OpenDialog,
	Ping,
	ReadEntities,
	ReadEntitiesById,
	ReadHub,
	ReadPolicies,
	ReadRoles,
	ReadSpaces,
	RunTask,
	SetMobile,
	SetSession,
	SignIn,
	SignOut,
	SignUp,
	ToggleMainNav,
	ToggleSecondaryNav,
	UpdateAccountPassword,
	UpdateAccountSettings,
	UpdateEntities,
	UpdateHub,
	UpdatePolicy,
	UpdateRole,
	UpdateSpace,
	ViewSpace,
];

export const actionDataByName: Map<string, ActionData> = new Map(
	actionDatas.map((e) => [e.name, e]),
);
