// generated by src/lib/app/eventTypes.gen.ts

import type {SvelteComponent} from 'svelte';
import type {Readable, Mutable} from '@feltcoop/svelte-gettable-stores';
import type {AsyncStatus} from '@feltcoop/util/async.js';

import type {ApiResult} from '$lib/server/api';
import type {
	NonAuthenticatedService,
	NonAuthorizedService,
	AuthorizedService,
} from '$lib/server/service';
import type {Community} from '$lib/vocab/community/community';
import type {PublicPersona, ClientPersona} from '$lib/vocab/persona/persona';
import type {Assignment} from '$lib/vocab/assignment/assignment';
import type {Space} from '$lib/vocab/space/space';
import type {Entity} from '$lib/vocab/entity/entity';
import type {EntityData, DirectoryEntityData} from '$lib/vocab/entity/entityData';
import type {Tie} from '$lib/vocab/tie/tie';
import type {Role} from '$lib/vocab/role/role';
import type {Policy} from '$lib/vocab/policy/policy';
import type {DispatchContext} from '$lib/app/dispatch';
import type {ClientSession, ClientAccountSession} from '$lib/vocab/account/account';
import type {CommunityTemplate} from '$lib/app/templates';

/* eslint-disable @typescript-eslint/array-type */

export type ServiceEventName =
	| 'SignUp'
	| 'SignIn'
	| 'SignOut'
	| 'UpdateAccountSettings'
	| 'UpdateAccountPassword'
	| 'CreateCommunity'
	| 'ReadCommunity'
	| 'UpdateCommunitySettings'
	| 'DeleteCommunity'
	| 'InviteToCommunity'
	| 'LeaveCommunity'
	| 'CreateAccountPersona'
	| 'DeletePersona'
	| 'CreateAssignment'
	| 'DeleteAssignment'
	| 'CreateSpace'
	| 'ReadSpaces'
	| 'UpdateSpace'
	| 'DeleteSpace'
	| 'CreateEntity'
	| 'UpdateEntity'
	| 'ReadEntities'
	| 'ReadEntitiesPaginated'
	| 'EraseEntities'
	| 'DeleteEntities'
	| 'CreateTie'
	| 'ReadTies'
	| 'DeleteTie'
	| 'CreateRole'
	| 'ReadRoles'
	| 'UpdateRole'
	| 'DeleteRole'
	| 'CreatePolicy'
	| 'ReadPolicies'
	| 'UpdatePolicy'
	| 'DeletePolicy'
	| 'Ping'
	| 'Ephemera';

export type ClientEventName =
	| 'QueryEntities'
	| 'SetSession'
	| 'ToggleMainNav'
	| 'ToggleSecondaryNav'
	| 'SetMobile'
	| 'OpenDialog'
	| 'CloseDialog'
	| 'ViewSpace'
	| 'ClearFreshness';

export interface EventParamsByName {
	SignUp: SignUpParams;
	SignIn: SignInParams;
	SignOut: SignOutParams;
	UpdateAccountSettings: UpdateAccountSettingsParams;
	UpdateAccountPassword: UpdateAccountPasswordParams;
	CreateCommunity: CreateCommunityParams;
	ReadCommunity: ReadCommunityParams;
	UpdateCommunitySettings: UpdateCommunitySettingsParams;
	DeleteCommunity: DeleteCommunityParams;
	InviteToCommunity: InviteToCommunityParams;
	LeaveCommunity: LeaveCommunityParams;
	CreateAccountPersona: CreateAccountPersonaParams;
	DeletePersona: DeletePersonaParams;
	CreateAssignment: CreateAssignmentParams;
	DeleteAssignment: DeleteAssignmentParams;
	CreateSpace: CreateSpaceParams;
	ReadSpaces: ReadSpacesParams;
	UpdateSpace: UpdateSpaceParams;
	DeleteSpace: DeleteSpaceParams;
	CreateEntity: CreateEntityParams;
	UpdateEntity: UpdateEntityParams;
	ReadEntities: ReadEntitiesParams;
	ReadEntitiesPaginated: ReadEntitiesPaginatedParams;
	QueryEntities: QueryEntitiesParams;
	EraseEntities: EraseEntitiesParams;
	DeleteEntities: DeleteEntitiesParams;
	CreateTie: CreateTieParams;
	ReadTies: ReadTiesParams;
	DeleteTie: DeleteTieParams;
	CreateRole: CreateRoleParams;
	ReadRoles: ReadRolesParams;
	UpdateRole: UpdateRoleParams;
	DeleteRole: DeleteRoleParams;
	CreatePolicy: CreatePolicyParams;
	ReadPolicies: ReadPoliciesParams;
	UpdatePolicy: UpdatePolicyParams;
	DeletePolicy: DeletePolicyParams;
	Ping: PingParams;
	Ephemera: EphemeraParams;
	SetSession: SetSessionParams;
	ToggleMainNav: ToggleMainNavParams;
	ToggleSecondaryNav: ToggleSecondaryNavParams;
	SetMobile: SetMobileParams;
	OpenDialog: OpenDialogParams;
	CloseDialog: CloseDialogParams;
	ViewSpace: ViewSpaceParams;
	ClearFreshness: ClearFreshnessParams;
}
export interface EventResponseByName {
	SignUp: SignUpResponse;
	SignIn: SignInResponse;
	SignOut: SignOutResponse;
	UpdateAccountSettings: UpdateAccountSettingsResponse;
	UpdateAccountPassword: UpdateAccountPasswordResponse;
	CreateCommunity: CreateCommunityResponse;
	ReadCommunity: ReadCommunityResponse;
	UpdateCommunitySettings: UpdateCommunitySettingsResponse;
	DeleteCommunity: DeleteCommunityResponse;
	InviteToCommunity: InviteToCommunityResponse;
	LeaveCommunity: LeaveCommunityResponse;
	CreateAccountPersona: CreateAccountPersonaResponse;
	DeletePersona: DeletePersonaResponse;
	CreateAssignment: CreateAssignmentResponse;
	DeleteAssignment: DeleteAssignmentResponse;
	CreateSpace: CreateSpaceResponse;
	ReadSpaces: ReadSpacesResponse;
	UpdateSpace: UpdateSpaceResponse;
	DeleteSpace: DeleteSpaceResponse;
	CreateEntity: CreateEntityResponse;
	UpdateEntity: UpdateEntityResponse;
	ReadEntities: ReadEntitiesResponse;
	ReadEntitiesPaginated: ReadEntitiesPaginatedResponse;
	EraseEntities: EraseEntitiesResponse;
	DeleteEntities: DeleteEntitiesResponse;
	CreateTie: CreateTieResponse;
	ReadTies: ReadTiesResponse;
	DeleteTie: DeleteTieResponse;
	CreateRole: CreateRoleResponse;
	ReadRoles: ReadRolesResponse;
	UpdateRole: UpdateRoleResponse;
	DeleteRole: DeleteRoleResponse;
	CreatePolicy: CreatePolicyResponse;
	ReadPolicies: ReadPoliciesResponse;
	UpdatePolicy: UpdatePolicyResponse;
	DeletePolicy: DeletePolicyResponse;
	Ping: PingResponse;
	Ephemera: EphemeraResponse;
}

export interface ServiceByName {
	Ping: NonAuthorizedService<PingParams, PingResponseResult>;
	Ephemera: AuthorizedService<EphemeraParams, EphemeraResponseResult>;
	SignUp: NonAuthenticatedService<SignUpParams, SignUpResponseResult>;
	SignIn: NonAuthenticatedService<SignInParams, SignInResponseResult>;
	SignOut: NonAuthorizedService<SignOutParams, SignOutResponseResult>;
	UpdateAccountSettings: NonAuthorizedService<
		UpdateAccountSettingsParams,
		UpdateAccountSettingsResponseResult
	>;
	UpdateAccountPassword: NonAuthorizedService<
		UpdateAccountPasswordParams,
		UpdateAccountPasswordResponseResult
	>;
	CreateAccountPersona: NonAuthorizedService<
		CreateAccountPersonaParams,
		CreateAccountPersonaResponseResult
	>;
	DeletePersona: AuthorizedService<DeletePersonaParams, DeletePersonaResponseResult>;
	ReadCommunity: AuthorizedService<ReadCommunityParams, ReadCommunityResponseResult>;
	CreateCommunity: AuthorizedService<CreateCommunityParams, CreateCommunityResponseResult>;
	UpdateCommunitySettings: AuthorizedService<
		UpdateCommunitySettingsParams,
		UpdateCommunitySettingsResponseResult
	>;
	DeleteCommunity: AuthorizedService<DeleteCommunityParams, DeleteCommunityResponseResult>;
	InviteToCommunity: AuthorizedService<InviteToCommunityParams, InviteToCommunityResponseResult>;
	LeaveCommunity: AuthorizedService<LeaveCommunityParams, LeaveCommunityResponseResult>;
	CreateAssignment: AuthorizedService<CreateAssignmentParams, CreateAssignmentResponseResult>;
	DeleteAssignment: AuthorizedService<DeleteAssignmentParams, DeleteAssignmentResponseResult>;
	ReadSpaces: AuthorizedService<ReadSpacesParams, ReadSpacesResponseResult>;
	CreateSpace: AuthorizedService<CreateSpaceParams, CreateSpaceResponseResult>;
	UpdateSpace: AuthorizedService<UpdateSpaceParams, UpdateSpaceResponseResult>;
	DeleteSpace: AuthorizedService<DeleteSpaceParams, DeleteSpaceResponseResult>;
	ReadEntities: AuthorizedService<ReadEntitiesParams, ReadEntitiesResponseResult>;
	ReadEntitiesPaginated: AuthorizedService<
		ReadEntitiesPaginatedParams,
		ReadEntitiesPaginatedResponseResult
	>;
	CreateEntity: AuthorizedService<CreateEntityParams, CreateEntityResponseResult>;
	UpdateEntity: AuthorizedService<UpdateEntityParams, UpdateEntityResponseResult>;
	EraseEntities: AuthorizedService<EraseEntitiesParams, EraseEntitiesResponseResult>;
	DeleteEntities: AuthorizedService<DeleteEntitiesParams, DeleteEntitiesResponseResult>;
	CreateTie: AuthorizedService<CreateTieParams, CreateTieResponseResult>;
	ReadTies: AuthorizedService<ReadTiesParams, ReadTiesResponseResult>;
	DeleteTie: AuthorizedService<DeleteTieParams, DeleteTieResponseResult>;
	CreateRole: AuthorizedService<CreateRoleParams, CreateRoleResponseResult>;
	ReadRoles: AuthorizedService<ReadRolesParams, ReadRolesResponseResult>;
	UpdateRole: AuthorizedService<UpdateRoleParams, UpdateRoleResponseResult>;
	DeleteRole: AuthorizedService<DeleteRoleParams, DeleteRoleResponseResult>;
	CreatePolicy: AuthorizedService<CreatePolicyParams, CreatePolicyResponseResult>;
	DeletePolicy: AuthorizedService<DeletePolicyParams, DeletePolicyResponseResult>;
	ReadPolicies: AuthorizedService<ReadPoliciesParams, ReadPoliciesResponseResult>;
	UpdatePolicy: AuthorizedService<UpdatePolicyParams, UpdatePolicyResponseResult>;
}

export interface SignUpParams {
	username: string;
	password: string;
}
export interface SignUpResponse {
	/**
	 *
	 * 		The session data loaded on each page for authenticated users.
	 *
	 */
	session: ClientAccountSession;
}
export type SignUpResponseResult = ApiResult<SignUpResponse>;

export interface SignInParams {
	username: string;
	password: string;
}
export interface SignInResponse {
	/**
	 *
	 * 		The session data loaded on each page for authenticated users.
	 *
	 */
	session: ClientAccountSession;
}
export type SignInResponseResult = ApiResult<SignInResponse>;

export type SignOutParams = null;
export type SignOutResponse = null;
export type SignOutResponseResult = ApiResult<SignOutResponse>;

export interface UpdateAccountSettingsParams {
	/**
	 *
	 * 		A nested set of attributes on Account & ClientAccount. Holds all account level settings.
	 *
	 */
	settings: {
		darkmode?: boolean;
	};
}
/**
 *
 * 		A client-facing subset of an Account. Excludes 'password' for security.
 *
 */
export interface UpdateAccountSettingsResponse {
	account_id: number;
	name: string;
	/**
	 *
	 * 		A nested set of attributes on Account & ClientAccount. Holds all account level settings.
	 *
	 */
	settings: {
		darkmode?: boolean;
	};
	created: Date;
	updated: Date | null;
}
export type UpdateAccountSettingsResponseResult = ApiResult<UpdateAccountSettingsResponse>;

export interface UpdateAccountPasswordParams {
	oldPassword: string;
	newPassword: string;
}
/**
 *
 * 		A client-facing subset of an Account. Excludes 'password' for security.
 *
 */
export interface UpdateAccountPasswordResponse {
	account_id: number;
	name: string;
	/**
	 *
	 * 		A nested set of attributes on Account & ClientAccount. Holds all account level settings.
	 *
	 */
	settings: {
		darkmode?: boolean;
	};
	created: Date;
	updated: Date | null;
}
export type UpdateAccountPasswordResponseResult = ApiResult<UpdateAccountPasswordResponse>;

export interface CreateCommunityParams {
	actor: number;
	template: CommunityTemplate;
}
export interface CreateCommunityResponse {
	/**
	 *
	 * 		Communities represent the membrane around the places Personas can interact with each other or with system level data.
	 * 		They have self contained governance and ownership of Spaces within them.
	 * 		By default they are hidden & undiscoverable and are only visible to a user once a Persona has been invited in.
	 *
	 */
	community: Community;
	roles: Role[];
	spaces: Space[];
	directories: (Entity & {data: DirectoryEntityData})[];
	assignments: Assignment[];
	policies: Policy[];
	personas: PublicPersona[];
}
export type CreateCommunityResponseResult = ApiResult<CreateCommunityResponse>;

export interface ReadCommunityParams {
	actor: number;
	community_id: number;
}
export interface ReadCommunityResponse {
	/**
	 *
	 * 		Communities represent the membrane around the places Personas can interact with each other or with system level data.
	 * 		They have self contained governance and ownership of Spaces within them.
	 * 		By default they are hidden & undiscoverable and are only visible to a user once a Persona has been invited in.
	 *
	 */
	community: Community;
	spaces: Space[];
	directories: (Entity & {data: DirectoryEntityData})[];
	roles: Role[];
	assignments: Assignment[];
	personas: PublicPersona[];
}
export type ReadCommunityResponseResult = ApiResult<ReadCommunityResponse>;

export interface UpdateCommunitySettingsParams {
	actor: number;
	community_id: number;
	/**
	 *
	 * 		A nested set of attributes on Community. Holds all community level settings.
	 *
	 */
	settings: {
		hue: number;
		defaultRoleId: number;
		instance?: {
			allowedAccountNames?: string[];
		};
	};
}
export type UpdateCommunitySettingsResponse = null;
export type UpdateCommunitySettingsResponseResult = ApiResult<UpdateCommunitySettingsResponse>;

export interface DeleteCommunityParams {
	actor: number;
	community_id: number;
}
export type DeleteCommunityResponse = null;
export type DeleteCommunityResponseResult = ApiResult<DeleteCommunityResponse>;

export interface InviteToCommunityParams {
	actor: number;
	community_id: number;
	name: string;
}
export interface InviteToCommunityResponse {
	/**
	 *
	 * 		A subset of a Persona available to all clients in a community.
	 *
	 */
	persona: PublicPersona;
	assignment: Assignment;
}
export type InviteToCommunityResponseResult = ApiResult<InviteToCommunityResponse>;

export interface LeaveCommunityParams {
	actor: number;
	persona_id: number;
	community_id: number;
}
export type LeaveCommunityResponse = null;
export type LeaveCommunityResponseResult = ApiResult<LeaveCommunityResponse>;

export interface CreateAccountPersonaParams {
	name: string;
}
export interface CreateAccountPersonaResponse {
	personas: ClientPersona[];
	communities: Community[];
	roles: Role[];
	policies: Policy[];
	spaces: Space[];
	directories: (Entity & {data: DirectoryEntityData})[];
	assignments: Assignment[];
}
export type CreateAccountPersonaResponseResult = ApiResult<CreateAccountPersonaResponse>;

export interface DeletePersonaParams {
	actor: number;
	persona_id: number;
}
export type DeletePersonaResponse = null;
export type DeletePersonaResponseResult = ApiResult<DeletePersonaResponse>;

export interface CreateAssignmentParams {
	actor: number;
	persona_id: number;
	community_id: number;
	role_id: number;
}
export interface CreateAssignmentResponse {
	assignment: Assignment;
}
export type CreateAssignmentResponseResult = ApiResult<CreateAssignmentResponse>;

export interface DeleteAssignmentParams {
	actor: number;
	assignment_id: number;
}
export type DeleteAssignmentResponse = null;
export type DeleteAssignmentResponseResult = ApiResult<DeleteAssignmentResponse>;

export interface CreateSpaceParams {
	actor: number;
	community_id: number;
	name: string;
	path: string;
	icon: string;
	view: string;
}
export interface CreateSpaceResponse {
	space: Space;
	directory: Entity & {data: DirectoryEntityData};
}
export type CreateSpaceResponseResult = ApiResult<CreateSpaceResponse>;

export interface ReadSpacesParams {
	actor: number;
	community_id: number;
}
export interface ReadSpacesResponse {
	spaces: Space[];
	directories: (Entity & {data: DirectoryEntityData})[];
}
export type ReadSpacesResponseResult = ApiResult<ReadSpacesResponse>;

export interface UpdateSpaceParams {
	actor: number;
	space_id: number;
	name?: string;
	path?: string;
	icon?: string;
	view?: string;
}
export interface UpdateSpaceResponse {
	space: Space;
}
export type UpdateSpaceResponseResult = ApiResult<UpdateSpaceResponse>;

export interface DeleteSpaceParams {
	actor: number;
	space_id: number;
}
export type DeleteSpaceResponse = null;
export type DeleteSpaceResponseResult = ApiResult<DeleteSpaceResponse>;

export interface CreateEntityParams {
	actor: number;
	space_id: number;
	data: EntityData;
	ties?: (
		| {
				source_id: number;
				type?: string;
		  }
		| {
				dest_id: number;
				type?: string;
		  }
	)[];
}
export interface CreateEntityResponse {
	entities: Entity[];
	ties: Tie[];
}
export type CreateEntityResponseResult = ApiResult<CreateEntityResponse>;

export interface UpdateEntityParams {
	actor: number;
	entity_id: number;
	data: EntityData | null;
}
export interface UpdateEntityResponse {
	entity: Entity;
}
export type UpdateEntityResponseResult = ApiResult<UpdateEntityResponse>;

export interface ReadEntitiesParams {
	actor: number;
	source_id: number;
}
export interface ReadEntitiesResponse {
	entities: Entity[];
	ties: Tie[];
}
export type ReadEntitiesResponseResult = ApiResult<ReadEntitiesResponse>;

export interface ReadEntitiesPaginatedParams {
	actor: number;
	source_id: number;
	pageSize?: number;
	pageKey?: number;
}
export interface ReadEntitiesPaginatedResponse {
	entities: Entity[];
	ties: Tie[];
}
export type ReadEntitiesPaginatedResponseResult = ApiResult<ReadEntitiesPaginatedResponse>;

export interface QueryEntitiesParams {
	actor: number;
	source_id: number;
}

export interface EraseEntitiesParams {
	actor: number;
	entityIds: number[];
}
export interface EraseEntitiesResponse {
	entities: Entity[];
}
export type EraseEntitiesResponseResult = ApiResult<EraseEntitiesResponse>;

export interface DeleteEntitiesParams {
	actor: number;
	entityIds: number[];
}
export type DeleteEntitiesResponse = null;
export type DeleteEntitiesResponseResult = ApiResult<DeleteEntitiesResponse>;

export interface CreateTieParams {
	actor: number;
	source_id: number;
	dest_id: number;
	type: string;
}
export interface CreateTieResponse {
	tie: Tie;
}
export type CreateTieResponseResult = ApiResult<CreateTieResponse>;

export interface ReadTiesParams {
	actor: number;
	source_id: number;
}
export interface ReadTiesResponse {
	ties: Tie[];
}
export type ReadTiesResponseResult = ApiResult<ReadTiesResponse>;

export interface DeleteTieParams {
	actor: number;
	tie_id: number;
}
export type DeleteTieResponse = null;
export type DeleteTieResponseResult = ApiResult<DeleteTieResponse>;

export interface CreateRoleParams {
	actor: number;
	community_id: number;
	name: string;
}
export interface CreateRoleResponse {
	role: Role;
}
export type CreateRoleResponseResult = ApiResult<CreateRoleResponse>;

export interface ReadRolesParams {
	actor: number;
	community_id: number;
}
export interface ReadRolesResponse {
	roles: Role[];
}
export type ReadRolesResponseResult = ApiResult<ReadRolesResponse>;

export interface UpdateRoleParams {
	actor: number;
	role_id: number;
	name: string;
}
export interface UpdateRoleResponse {
	role: Role;
}
export type UpdateRoleResponseResult = ApiResult<UpdateRoleResponse>;

export interface DeleteRoleParams {
	actor: number;
	role_id: number;
}
export type DeleteRoleResponse = null;
export type DeleteRoleResponseResult = ApiResult<DeleteRoleResponse>;

export interface CreatePolicyParams {
	actor: number;
	role_id: number;
	permission: string;
}
export interface CreatePolicyResponse {
	policy: Policy;
}
export type CreatePolicyResponseResult = ApiResult<CreatePolicyResponse>;

export interface ReadPoliciesParams {
	actor: number;
	role_id: number;
}
export interface ReadPoliciesResponse {
	policies: Policy[];
}
export type ReadPoliciesResponseResult = ApiResult<ReadPoliciesResponse>;

export interface UpdatePolicyParams {
	actor: number;
	policy_id: number;
	data: {
		[k: string]: unknown;
	} | null;
}
export interface UpdatePolicyResponse {
	policy: Policy;
}
export type UpdatePolicyResponseResult = ApiResult<UpdatePolicyResponse>;

export interface DeletePolicyParams {
	actor: number;
	policy_id: number;
}
export type DeletePolicyResponse = null;
export type DeletePolicyResponseResult = ApiResult<DeletePolicyResponse>;

export type PingParams = null;
export type PingResponse = null;
export type PingResponseResult = ApiResult<PingResponse>;

export interface EphemeraParams {
	actor: number;
	space_id: number;
	data: {
		type: string;
		[k: string]: unknown;
	};
}
export interface EphemeraResponse {
	actor: number;
	space_id: number;
	data: {
		type: string;
		[k: string]: unknown;
	};
}
export type EphemeraResponseResult = ApiResult<EphemeraResponse>;

export interface SetSessionParams {
	session: ClientSession;
}

export type ToggleMainNavParams = void;

export type ToggleSecondaryNavParams = void;

export type SetMobileParams = boolean;

export interface OpenDialogParams {
	Component: typeof SvelteComponent;
	props?: {
		[k: string]: unknown;
	};
	dialogProps?: {
		[k: string]: unknown;
	};
}

export type CloseDialogParams = void;

export interface ViewSpaceParams {
	space_id: number;
	view: string | null;
}

export interface ClearFreshnessParams {
	directory_id: number;
}

export interface Dispatch {
	SignUp: (params: SignUpParams) => Promise<SignUpResponseResult>;
	SignIn: (params: SignInParams) => Promise<SignInResponseResult>;
	SignOut: () => Promise<SignOutResponseResult>;
	UpdateAccountSettings: (
		params: UpdateAccountSettingsParams,
	) => Promise<UpdateAccountSettingsResponseResult>;
	UpdateAccountPassword: (
		params: UpdateAccountPasswordParams,
	) => Promise<UpdateAccountPasswordResponseResult>;
	CreateCommunity: (params: CreateCommunityParams) => Promise<CreateCommunityResponseResult>;
	ReadCommunity: (params: ReadCommunityParams) => Promise<ReadCommunityResponseResult>;
	UpdateCommunitySettings: (
		params: UpdateCommunitySettingsParams,
	) => Promise<UpdateCommunitySettingsResponseResult>;
	DeleteCommunity: (params: DeleteCommunityParams) => Promise<DeleteCommunityResponseResult>;
	InviteToCommunity: (params: InviteToCommunityParams) => Promise<InviteToCommunityResponseResult>;
	LeaveCommunity: (params: LeaveCommunityParams) => Promise<LeaveCommunityResponseResult>;
	CreateAccountPersona: (
		params: CreateAccountPersonaParams,
	) => Promise<CreateAccountPersonaResponseResult>;
	DeletePersona: (params: DeletePersonaParams) => Promise<DeletePersonaResponseResult>;
	CreateAssignment: (params: CreateAssignmentParams) => Promise<CreateAssignmentResponseResult>;
	DeleteAssignment: (params: DeleteAssignmentParams) => Promise<DeleteAssignmentResponseResult>;
	CreateSpace: (params: CreateSpaceParams) => Promise<CreateSpaceResponseResult>;
	ReadSpaces: (params: ReadSpacesParams) => Promise<ReadSpacesResponseResult>;
	UpdateSpace: (params: UpdateSpaceParams) => Promise<UpdateSpaceResponseResult>;
	DeleteSpace: (params: DeleteSpaceParams) => Promise<DeleteSpaceResponseResult>;
	CreateEntity: (params: CreateEntityParams) => Promise<CreateEntityResponseResult>;
	UpdateEntity: (params: UpdateEntityParams) => Promise<UpdateEntityResponseResult>;
	ReadEntities: (params: ReadEntitiesParams) => Promise<ReadEntitiesResponseResult>;
	ReadEntitiesPaginated: (
		params: ReadEntitiesPaginatedParams,
	) => Promise<ReadEntitiesPaginatedResponseResult>;
	QueryEntities: (params: QueryEntitiesParams) => {
		data: Mutable<Set<Readable<Entity>>>;
		status: Readable<AsyncStatus>;
	};
	EraseEntities: (params: EraseEntitiesParams) => Promise<EraseEntitiesResponseResult>;
	DeleteEntities: (params: DeleteEntitiesParams) => Promise<DeleteEntitiesResponseResult>;
	CreateTie: (params: CreateTieParams) => Promise<CreateTieResponseResult>;
	ReadTies: (params: ReadTiesParams) => Promise<ReadTiesResponseResult>;
	DeleteTie: (params: DeleteTieParams) => Promise<DeleteTieResponseResult>;
	CreateRole: (params: CreateRoleParams) => Promise<CreateRoleResponseResult>;
	ReadRoles: (params: ReadRolesParams) => Promise<ReadRolesResponseResult>;
	UpdateRole: (params: UpdateRoleParams) => Promise<UpdateRoleResponseResult>;
	DeleteRole: (params: DeleteRoleParams) => Promise<DeleteRoleResponseResult>;
	CreatePolicy: (params: CreatePolicyParams) => Promise<CreatePolicyResponseResult>;
	ReadPolicies: (params: ReadPoliciesParams) => Promise<ReadPoliciesResponseResult>;
	UpdatePolicy: (params: UpdatePolicyParams) => Promise<UpdatePolicyResponseResult>;
	DeletePolicy: (params: DeletePolicyParams) => Promise<DeletePolicyResponseResult>;
	Ping: () => Promise<ApiResult<null>>;
	Ephemera: (params: EphemeraParams) => Promise<EphemeraResponseResult>;
	SetSession: (params: SetSessionParams) => void;
	ToggleMainNav: (params: ToggleMainNavParams) => void;
	ToggleSecondaryNav: (params: ToggleSecondaryNavParams) => void;
	SetMobile: (params: SetMobileParams) => void;
	OpenDialog: (params: OpenDialogParams) => void;
	CloseDialog: (params: CloseDialogParams) => void;
	ViewSpace: (params: ViewSpaceParams) => void;
	ClearFreshness: (params: ClearFreshnessParams) => void;
}

export interface Mutations {
	SignUp: (
		ctx: DispatchContext<SignUpParams, SignUpResponseResult>,
	) => Promise<SignUpResponseResult>;
	SignIn: (
		ctx: DispatchContext<SignInParams, SignInResponseResult>,
	) => Promise<SignInResponseResult>;
	SignOut: (
		ctx: DispatchContext<SignOutParams, SignOutResponseResult>,
	) => Promise<SignOutResponseResult>;
	UpdateAccountSettings: (
		ctx: DispatchContext<UpdateAccountSettingsParams, UpdateAccountSettingsResponseResult>,
	) => Promise<UpdateAccountSettingsResponseResult>;
	UpdateAccountPassword: (
		ctx: DispatchContext<UpdateAccountPasswordParams, UpdateAccountPasswordResponseResult>,
	) => Promise<UpdateAccountPasswordResponseResult>;
	CreateCommunity: (
		ctx: DispatchContext<CreateCommunityParams, CreateCommunityResponseResult>,
	) => Promise<CreateCommunityResponseResult>;
	ReadCommunity: (
		ctx: DispatchContext<ReadCommunityParams, ReadCommunityResponseResult>,
	) => Promise<ReadCommunityResponseResult>;
	UpdateCommunitySettings: (
		ctx: DispatchContext<UpdateCommunitySettingsParams, UpdateCommunitySettingsResponseResult>,
	) => Promise<UpdateCommunitySettingsResponseResult>;
	DeleteCommunity: (
		ctx: DispatchContext<DeleteCommunityParams, DeleteCommunityResponseResult>,
	) => Promise<DeleteCommunityResponseResult>;
	InviteToCommunity: (
		ctx: DispatchContext<InviteToCommunityParams, InviteToCommunityResponseResult>,
	) => Promise<InviteToCommunityResponseResult>;
	LeaveCommunity: (
		ctx: DispatchContext<LeaveCommunityParams, LeaveCommunityResponseResult>,
	) => Promise<LeaveCommunityResponseResult>;
	CreateAccountPersona: (
		ctx: DispatchContext<CreateAccountPersonaParams, CreateAccountPersonaResponseResult>,
	) => Promise<CreateAccountPersonaResponseResult>;
	DeletePersona: (
		ctx: DispatchContext<DeletePersonaParams, DeletePersonaResponseResult>,
	) => Promise<DeletePersonaResponseResult>;
	CreateAssignment: (
		ctx: DispatchContext<CreateAssignmentParams, CreateAssignmentResponseResult>,
	) => Promise<CreateAssignmentResponseResult>;
	DeleteAssignment: (
		ctx: DispatchContext<DeleteAssignmentParams, DeleteAssignmentResponseResult>,
	) => Promise<DeleteAssignmentResponseResult>;
	CreateSpace: (
		ctx: DispatchContext<CreateSpaceParams, CreateSpaceResponseResult>,
	) => Promise<CreateSpaceResponseResult>;
	ReadSpaces: (
		ctx: DispatchContext<ReadSpacesParams, ReadSpacesResponseResult>,
	) => Promise<ReadSpacesResponseResult>;
	UpdateSpace: (
		ctx: DispatchContext<UpdateSpaceParams, UpdateSpaceResponseResult>,
	) => Promise<UpdateSpaceResponseResult>;
	DeleteSpace: (
		ctx: DispatchContext<DeleteSpaceParams, DeleteSpaceResponseResult>,
	) => Promise<DeleteSpaceResponseResult>;
	CreateEntity: (
		ctx: DispatchContext<CreateEntityParams, CreateEntityResponseResult>,
	) => Promise<CreateEntityResponseResult>;
	UpdateEntity: (
		ctx: DispatchContext<UpdateEntityParams, UpdateEntityResponseResult>,
	) => Promise<UpdateEntityResponseResult>;
	ReadEntities: (
		ctx: DispatchContext<ReadEntitiesParams, ReadEntitiesResponseResult>,
	) => Promise<ReadEntitiesResponseResult>;
	ReadEntitiesPaginated: (
		ctx: DispatchContext<ReadEntitiesPaginatedParams, ReadEntitiesPaginatedResponseResult>,
	) => Promise<ReadEntitiesPaginatedResponseResult>;
	QueryEntities: (ctx: DispatchContext<QueryEntitiesParams, void>) => {
		data: Mutable<Set<Readable<Entity>>>;
		status: Readable<AsyncStatus>;
	};
	EraseEntities: (
		ctx: DispatchContext<EraseEntitiesParams, EraseEntitiesResponseResult>,
	) => Promise<EraseEntitiesResponseResult>;
	DeleteEntities: (
		ctx: DispatchContext<DeleteEntitiesParams, DeleteEntitiesResponseResult>,
	) => Promise<DeleteEntitiesResponseResult>;
	CreateTie: (
		ctx: DispatchContext<CreateTieParams, CreateTieResponseResult>,
	) => Promise<CreateTieResponseResult>;
	ReadTies: (
		ctx: DispatchContext<ReadTiesParams, ReadTiesResponseResult>,
	) => Promise<ReadTiesResponseResult>;
	DeleteTie: (
		ctx: DispatchContext<DeleteTieParams, DeleteTieResponseResult>,
	) => Promise<DeleteTieResponseResult>;
	CreateRole: (
		ctx: DispatchContext<CreateRoleParams, CreateRoleResponseResult>,
	) => Promise<CreateRoleResponseResult>;
	ReadRoles: (
		ctx: DispatchContext<ReadRolesParams, ReadRolesResponseResult>,
	) => Promise<ReadRolesResponseResult>;
	UpdateRole: (
		ctx: DispatchContext<UpdateRoleParams, UpdateRoleResponseResult>,
	) => Promise<UpdateRoleResponseResult>;
	DeleteRole: (
		ctx: DispatchContext<DeleteRoleParams, DeleteRoleResponseResult>,
	) => Promise<DeleteRoleResponseResult>;
	CreatePolicy: (
		ctx: DispatchContext<CreatePolicyParams, CreatePolicyResponseResult>,
	) => Promise<CreatePolicyResponseResult>;
	ReadPolicies: (
		ctx: DispatchContext<ReadPoliciesParams, ReadPoliciesResponseResult>,
	) => Promise<ReadPoliciesResponseResult>;
	UpdatePolicy: (
		ctx: DispatchContext<UpdatePolicyParams, UpdatePolicyResponseResult>,
	) => Promise<UpdatePolicyResponseResult>;
	DeletePolicy: (
		ctx: DispatchContext<DeletePolicyParams, DeletePolicyResponseResult>,
	) => Promise<DeletePolicyResponseResult>;
	Ping: (ctx: DispatchContext<PingParams, PingResponseResult>) => Promise<ApiResult<null>>;
	Ephemera: (
		ctx: DispatchContext<EphemeraParams, EphemeraResponseResult>,
	) => Promise<EphemeraResponseResult>;
	SetSession: (ctx: DispatchContext<SetSessionParams, void>) => void;
	ToggleMainNav: (ctx: DispatchContext<ToggleMainNavParams, void>) => void;
	ToggleSecondaryNav: (ctx: DispatchContext<ToggleSecondaryNavParams, void>) => void;
	SetMobile: (ctx: DispatchContext<SetMobileParams, void>) => void;
	OpenDialog: (ctx: DispatchContext<OpenDialogParams, void>) => void;
	CloseDialog: (ctx: DispatchContext<CloseDialogParams, void>) => void;
	ViewSpace: (ctx: DispatchContext<ViewSpaceParams, void>) => void;
	ClearFreshness: (ctx: DispatchContext<ClearFreshnessParams, void>) => void;
}

// generated by src/lib/app/eventTypes.gen.ts
