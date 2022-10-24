// generated by src/lib/util/randomEventParamsTypes.gen.ts

import type {RandomVocab, RandomVocabContext} from '$lib/util/randomVocab';
import type {
	SetSessionParams,
	SignInParams,
	SignOutParams,
	SignUpParams,
	UpdateAccountSettingsParams,
	CreateCommunityParams,
	ReadCommunityParams,
	ReadCommunitiesParams,
	UpdateCommunitySettingsParams,
	DeleteCommunityParams,
	LeaveCommunityParams,
	CreateAccountPersonaParams,
	ReadPersonaParams,
	CreateAssignmentParams,
	DeleteAssignmentParams,
	CreateSpaceParams,
	ReadSpaceParams,
	ReadSpacesParams,
	UpdateSpaceParams,
	DeleteSpaceParams,
	CreateEntityParams,
	UpdateEntityParams,
	ReadEntitiesParams,
	ReadEntitiesPaginatedParams,
	QueryEntitiesParams,
	EraseEntitiesParams,
	DeleteEntitiesParams,
	CreateTieParams,
	ReadTiesParams,
	DeleteTieParams,
	CreateRoleParams,
	ReadRolesParams,
	UpdateRoleParams,
	DeleteRoleParams,
	PingParams,
	EphemeraParams,
	ToggleMainNavParams,
	ToggleSecondaryNavParams,
	SetMobileParams,
	OpenDialogParams,
	CloseDialogParams,
	ViewSpaceParams,
	ClearFreshnessParams,
} from '$lib/app/eventTypes';

export interface RandomEventParams {
	SetSession: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<SetSessionParams>;
	SignIn: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<SignInParams>;
	SignOut: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<SignOutParams>;
	SignUp: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<SignUpParams>;
	UpdateAccountSettings: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<UpdateAccountSettingsParams>;
	CreateCommunity: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<CreateCommunityParams>;
	ReadCommunity: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<ReadCommunityParams>;
	ReadCommunities: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<ReadCommunitiesParams>;
	UpdateCommunitySettings: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<UpdateCommunitySettingsParams>;
	DeleteCommunity: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<DeleteCommunityParams>;
	LeaveCommunity: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<LeaveCommunityParams>;
	CreateAccountPersona: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<CreateAccountPersonaParams>;
	ReadPersona: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<ReadPersonaParams>;
	CreateAssignment: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<CreateAssignmentParams>;
	DeleteAssignment: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<DeleteAssignmentParams>;
	CreateSpace: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<CreateSpaceParams>;
	ReadSpace: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<ReadSpaceParams>;
	ReadSpaces: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<ReadSpacesParams>;
	UpdateSpace: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<UpdateSpaceParams>;
	DeleteSpace: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<DeleteSpaceParams>;
	CreateEntity: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<CreateEntityParams>;
	UpdateEntity: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<UpdateEntityParams>;
	ReadEntities: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<ReadEntitiesParams>;
	ReadEntitiesPaginated: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<ReadEntitiesPaginatedParams>;
	QueryEntities: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<QueryEntitiesParams>;
	EraseEntities: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<EraseEntitiesParams>;
	DeleteEntities: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<DeleteEntitiesParams>;
	CreateTie: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<CreateTieParams>;
	ReadTies: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<ReadTiesParams>;
	DeleteTie: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<DeleteTieParams>;
	CreateRole: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<CreateRoleParams>;
	ReadRoles: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<ReadRolesParams>;
	UpdateRole: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<UpdateRoleParams>;
	DeleteRole: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<DeleteRoleParams>;
	Ping: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<PingParams>;
	Ephemera: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<EphemeraParams>;
	ToggleMainNav: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<ToggleMainNavParams>;
	ToggleSecondaryNav: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<ToggleSecondaryNavParams>;
	SetMobile: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<SetMobileParams>;
	OpenDialog: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<OpenDialogParams>;
	CloseDialog: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<CloseDialogParams>;
	ViewSpace: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<ViewSpaceParams>;
	ClearFreshness: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<ClearFreshnessParams>;
}

// generated by src/lib/util/randomEventParamsTypes.gen.ts
