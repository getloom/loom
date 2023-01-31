// generated by src/lib/util/randomEventParamsTypes.gen.ts

import type {RandomVocab, RandomVocabContext} from '$lib/util/randomVocab';
import type {
	SignUpParams,
	SignInParams,
	SignOutParams,
	UpdateAccountSettingsParams,
	UpdateAccountPasswordParams,
	CreateCommunityParams,
	ReadCommunityParams,
	UpdateCommunitySettingsParams,
	DeleteCommunityParams,
	InviteToCommunityParams,
	LeaveCommunityParams,
	KickFromCommunityParams,
	CreateAccountPersonaParams,
	DeletePersonaParams,
	CreateAssignmentParams,
	DeleteAssignmentParams,
	CreateSpaceParams,
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
	CreateRoleParams,
	ReadRolesParams,
	UpdateRoleParams,
	DeleteRoleParams,
	CreatePolicyParams,
	ReadPoliciesParams,
	UpdatePolicyParams,
	DeletePolicyParams,
	PingParams,
	EphemeraParams,
	SetSessionParams,
	ToggleMainNavParams,
	ToggleSecondaryNavParams,
	SetMobileParams,
	OpenDialogParams,
	CloseDialogParams,
	ViewSpaceParams,
	ClearFreshnessParams,
} from '$lib/app/eventTypes';

export interface RandomEventParams {
	SignUp: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<SignUpParams>;
	SignIn: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<SignInParams>;
	SignOut: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<SignOutParams>;
	UpdateAccountSettings: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<UpdateAccountSettingsParams>;
	UpdateAccountPassword: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<UpdateAccountPasswordParams>;
	CreateCommunity: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<CreateCommunityParams>;
	ReadCommunity: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<ReadCommunityParams>;
	UpdateCommunitySettings: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<UpdateCommunitySettingsParams>;
	DeleteCommunity: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<DeleteCommunityParams>;
	InviteToCommunity: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<InviteToCommunityParams>;
	LeaveCommunity: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<LeaveCommunityParams>;
	KickFromCommunity: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<KickFromCommunityParams>;
	CreateAccountPersona: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<CreateAccountPersonaParams>;
	DeletePersona: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<DeletePersonaParams>;
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
	CreateRole: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<CreateRoleParams>;
	ReadRoles: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<ReadRolesParams>;
	UpdateRole: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<UpdateRoleParams>;
	DeleteRole: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<DeleteRoleParams>;
	CreatePolicy: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<CreatePolicyParams>;
	ReadPolicies: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<ReadPoliciesParams>;
	UpdatePolicy: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<UpdatePolicyParams>;
	DeletePolicy: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<DeletePolicyParams>;
	Ping: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<PingParams>;
	Ephemera: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<EphemeraParams>;
	SetSession: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<SetSessionParams>;
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
