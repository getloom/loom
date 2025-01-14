// generated by src/lib/util/randomActionParamsTypes.gen.ts

import type {RandomVocab, RandomVocabContext} from '$lib/util/randomVocab.js';
import type {
	ClearFreshnessParams,
	CloseDialogParams,
	CreateAccountActorParams,
	CreateAssignmentParams,
	CreateEntityParams,
	CreateHubParams,
	CreateInviteParams,
	CreatePolicyParams,
	CreateRoleParams,
	CreateSpaceParams,
	DeleteActorParams,
	DeleteAssignmentParams,
	DeleteEntitiesParams,
	DeleteHubParams,
	DeletePolicyParams,
	DeleteRoleParams,
	DeleteSpaceParams,
	EphemeraParams,
	EraseEntitiesParams,
	InviteToHubParams,
	KickFromHubParams,
	LeaveHubParams,
	OpenDialogParams,
	PingParams,
	ReadEntitiesParams,
	ReadEntitiesByIdParams,
	ReadHubParams,
	ReadPoliciesParams,
	ReadRolesParams,
	ReadSpacesParams,
	RunTaskParams,
	SetMobileParams,
	SetSessionParams,
	SignInParams,
	SignOutParams,
	SignUpParams,
	ToggleMainNavParams,
	ToggleSecondaryNavParams,
	UpdateAccountPasswordParams,
	UpdateAccountSettingsParams,
	UpdateEntitiesParams,
	UpdateHubParams,
	UpdatePolicyParams,
	UpdateRoleParams,
	UpdateSpaceParams,
	ViewSpaceParams,
} from '$lib/vocab/action/actionTypes.js';

export interface RandomActionParams {
	ClearFreshness: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<ClearFreshnessParams>;
	CloseDialog: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<CloseDialogParams>;
	CreateAccountActor: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<CreateAccountActorParams>;
	CreateAssignment: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<CreateAssignmentParams>;
	CreateEntity: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<CreateEntityParams>;
	CreateHub: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<CreateHubParams>;
	CreateInvite: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<CreateInviteParams>;
	CreatePolicy: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<CreatePolicyParams>;
	CreateRole: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<CreateRoleParams>;
	CreateSpace: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<CreateSpaceParams>;
	DeleteActor: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<DeleteActorParams>;
	DeleteAssignment: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<DeleteAssignmentParams>;
	DeleteEntities: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<DeleteEntitiesParams>;
	DeleteHub: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<DeleteHubParams>;
	DeletePolicy: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<DeletePolicyParams>;
	DeleteRole: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<DeleteRoleParams>;
	DeleteSpace: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<DeleteSpaceParams>;
	Ephemera: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<EphemeraParams>;
	EraseEntities: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<EraseEntitiesParams>;
	InviteToHub: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<InviteToHubParams>;
	KickFromHub: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<KickFromHubParams>;
	LeaveHub: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<LeaveHubParams>;
	OpenDialog: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<OpenDialogParams>;
	Ping: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<PingParams>;
	ReadEntities: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<ReadEntitiesParams>;
	ReadEntitiesById: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<ReadEntitiesByIdParams>;
	ReadHub: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<ReadHubParams>;
	ReadPolicies: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<ReadPoliciesParams>;
	ReadRoles: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<ReadRolesParams>;
	ReadSpaces: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<ReadSpacesParams>;
	RunTask: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<RunTaskParams>;
	SetMobile: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<SetMobileParams>;
	SetSession: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<SetSessionParams>;
	SignIn: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<SignInParams>;
	SignOut: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<SignOutParams>;
	SignUp: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<SignUpParams>;
	ToggleMainNav: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<ToggleMainNavParams>;
	ToggleSecondaryNav: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<ToggleSecondaryNavParams>;
	UpdateAccountPassword: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<UpdateAccountPasswordParams>;
	UpdateAccountSettings: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<UpdateAccountSettingsParams>;
	UpdateEntities: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<UpdateEntitiesParams>;
	UpdateHub: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<UpdateHubParams>;
	UpdatePolicy: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<UpdatePolicyParams>;
	UpdateRole: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<UpdateRoleParams>;
	UpdateSpace: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<UpdateSpaceParams>;
	ViewSpace: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<ViewSpaceParams>;
}

// generated by src/lib/util/randomActionParamsTypes.gen.ts
