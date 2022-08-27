import type {Mutation} from '$lib/ui/mutation';
import {Login, Logout, SetSession} from '$lib/session/sessionMutations';
import {CreateAccountPersona} from '$lib/vocab/persona/personaMutations';
import {
	ReadCommunities,
	ReadCommunity,
	CreateCommunity,
	UpdateCommunitySettings,
	DeleteCommunity,
} from '$lib/vocab/community/communityMutations';
import {CreateSpace, DeleteSpace, UpdateSpace} from '$lib/vocab/space/spaceMutations';
import {CreateMembership, DeleteMembership} from '$lib/vocab/membership/membershipMutations';
import {
	CreateEntity,
	UpdateEntity,
	EraseEntities,
	DeleteEntities,
	ReadEntities,
	ReadEntitiesPaginated,
	QueryEntities,
} from '$lib/vocab/entity/entityMutations';
import {CreateTie, ReadTies, DeleteTie} from '$lib/vocab/tie/tieMutations';
import {
	Ping,
	Ephemera,
	SetMobile,
	OpenDialog,
	CloseDialog,
	ViewSpace,
	ClearFreshness,
	ToggleMainNav,
	ToggleSecondaryNav,
} from '$lib/ui/uiMutations';

export const mutations: Record<string, Mutation> = {
	// sessionMutations
	SetSession,
	Login,
	Logout,
	// personaMutations
	CreateAccountPersona,
	// communityMutations
	ReadCommunities,
	ReadCommunity,
	CreateCommunity,
	UpdateCommunitySettings,
	DeleteCommunity,
	// spaceMutations
	CreateSpace,
	DeleteSpace,
	UpdateSpace,
	// membershipMutations
	CreateMembership,
	DeleteMembership,
	// entityMutations
	CreateEntity,
	UpdateEntity,
	EraseEntities,
	DeleteEntities,
	ReadEntities,
	ReadEntitiesPaginated,
	QueryEntities,
	// tieMutations
	CreateTie,
	ReadTies,
	DeleteTie,
	// uiMutations
	Ping,
	Ephemera,
	SetMobile,
	OpenDialog,
	CloseDialog,
	ViewSpace,
	ClearFreshness,
	ToggleMainNav,
	ToggleSecondaryNav,
};
