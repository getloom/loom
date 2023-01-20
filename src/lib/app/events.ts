import type {EventInfo} from '$lib/vocab/event/event';
import {
	SignIn,
	SignOut,
	SignUp,
	UpdateAccountSettings,
	UpdateAccountPassword,
} from '$lib/vocab/account/accountEvents';
import {
	CreateCommunity,
	ReadCommunity,
	UpdateCommunitySettings,
	DeleteCommunity,
	InviteToCommunity,
	LeaveCommunity,
} from '$lib/vocab/community/communityEvents';
import {CreateAccountPersona, DeletePersona} from '$lib/vocab/persona/personaEvents';
import {CreateAssignment, DeleteAssignment} from '$lib/vocab/assignment/assignmentEvents';
import {CreateSpace, ReadSpaces, UpdateSpace, DeleteSpace} from '$lib/vocab/space/spaceEvents';
import {
	CreateEntity,
	UpdateEntity,
	ReadEntities,
	QueryEntities,
	EraseEntities,
	DeleteEntities,
	ReadEntitiesPaginated,
} from '$lib/vocab/entity/entityEvents';
import {CreateTie, ReadTies, DeleteTie} from '$lib/vocab/tie/tieEvents';
import {CreateRole, ReadRoles, UpdateRole, DeleteRole} from '$lib/vocab/role/roleEvents';
import {
	CreatePolicy,
	ReadPolicies,
	UpdatePolicy,
	DeletePolicy,
} from '$lib/vocab/policy/policyEvents';
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
} from '$lib/ui/uiEvents';

export const eventInfos: EventInfo[] = [
	// accountEvents
	SignUp,
	SignIn,
	SignOut,
	UpdateAccountSettings,
	UpdateAccountPassword,
	// communityEvents
	CreateCommunity,
	ReadCommunity,
	UpdateCommunitySettings,
	DeleteCommunity,
	InviteToCommunity,
	LeaveCommunity,
	// personaEvents
	CreateAccountPersona,
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
	UpdateEntity,
	ReadEntities,
	ReadEntitiesPaginated,
	QueryEntities,
	EraseEntities,
	DeleteEntities,
	// tieEvents
	CreateTie,
	ReadTies,
	DeleteTie,
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

export const eventInfoByName: Map<string, EventInfo> = new Map(eventInfos.map((e) => [e.name, e]));
