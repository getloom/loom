import type {EventInfo} from '$lib/vocab/event/event';
import {SignIn, SignOut, SetSession} from '$lib/session/sessionEvents';
import {UpdateAccountSettings} from '$lib/vocab/account/accountEvents';
import {
	CreateCommunity,
	ReadCommunity,
	ReadCommunities,
	UpdateCommunitySettings,
	DeleteCommunity,
	LeaveCommunity,
} from '$lib/vocab/community/communityEvents';
import {CreateAccountPersona, ReadPersona} from '$lib/vocab/persona/personaEvents';
import {CreateAssignment, DeleteAssignment} from '$lib/vocab/assignment/assignmentEvents';
import {
	CreateSpace,
	ReadSpace,
	ReadSpaces,
	UpdateSpace,
	DeleteSpace,
} from '$lib/vocab/space/spaceEvents';
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
	Ping,
	Ephemera,
	ToggleMainNav,
	ToggleSecondaryNav,
	SetMobile,
	OpenDialog,
	CloseDialog,
	ViewSpace,
	ClearFreshness,
} from '$lib/ui/uiEvents';

export const eventInfos: EventInfo[] = [
	// sessionEvents
	SetSession,
	SignIn,
	SignOut,
	// accountEvents
	UpdateAccountSettings,
	// communityEvents
	CreateCommunity,
	ReadCommunity,
	ReadCommunities,
	UpdateCommunitySettings,
	DeleteCommunity,
	LeaveCommunity,
	// personaEvents
	CreateAccountPersona,
	ReadPersona,
	// assignmentEvents
	CreateAssignment,
	DeleteAssignment,
	// spaceEvents
	CreateSpace,
	ReadSpace,
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
	// uiEvents
	Ping,
	Ephemera,
	ToggleMainNav,
	ToggleSecondaryNav,
	SetMobile,
	OpenDialog,
	CloseDialog,
	ViewSpace,
	ClearFreshness,
];

export const eventInfoByName: Map<string, EventInfo> = new Map(eventInfos.map((e) => [e.name, e]));
