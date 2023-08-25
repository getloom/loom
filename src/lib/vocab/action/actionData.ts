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
