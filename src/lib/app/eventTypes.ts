// generated by src/lib/app/eventTypes.gen.ts

import type {SvelteComponent} from 'svelte';
import type {Readable, Mutable} from '@feltcoop/svelte-gettable-stores';
import type {AsyncStatus} from '@feltcoop/felt';

import type {ApiResult} from '$lib/server/api';
import type {
	NonAuthenticatedService,
	NonAuthorizedService,
	AuthorizedService,
} from '$lib/server/service';
import type {Community} from '$lib/vocab/community/community';
import type {Persona, AccountPersona} from '$lib/vocab/persona/persona';
import type {Assignment} from '$lib/vocab/assignment/assignment';
import type {Space} from '$lib/vocab/space/space';
import type {Entity} from '$lib/vocab/entity/entity';
import type {EntityData, DirectoryEntityData} from '$lib/vocab/entity/entityData';
import type {Tie} from '$lib/vocab/tie/tie';
import type {Role} from '$lib/vocab/role/role';
import type {DispatchContext} from '$lib/app/dispatch';
import type {ClientSession, ClientAccountSession} from '$lib/session/clientSession';

/* eslint-disable @typescript-eslint/array-type */

export type ServiceEventName =
	| 'Login'
	| 'Logout'
	| 'UpdateAccountSettings'
	| 'CreateCommunity'
	| 'ReadCommunity'
	| 'ReadCommunities'
	| 'UpdateCommunitySettings'
	| 'DeleteCommunity'
	| 'LeaveCommunity'
	| 'CreateAccountPersona'
	| 'ReadPersona'
	| 'CreateAssignment'
	| 'DeleteAssignment'
	| 'CreateSpace'
	| 'ReadSpace'
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
	| 'Ping'
	| 'Ephemera';

export type ClientEventName =
	| 'SetSession'
	| 'QueryEntities'
	| 'ToggleMainNav'
	| 'ToggleSecondaryNav'
	| 'SetMobile'
	| 'OpenDialog'
	| 'CloseDialog'
	| 'ViewSpace'
	| 'ClearFreshness';

export interface EventParamsByName {
	SetSession: SetSessionParams;
	Login: LoginParams;
	Logout: LogoutParams;
	UpdateAccountSettings: UpdateAccountSettingsParams;
	CreateCommunity: CreateCommunityParams;
	ReadCommunity: ReadCommunityParams;
	ReadCommunities: ReadCommunitiesParams;
	UpdateCommunitySettings: UpdateCommunitySettingsParams;
	DeleteCommunity: DeleteCommunityParams;
	LeaveCommunity: LeaveCommunityParams;
	CreateAccountPersona: CreateAccountPersonaParams;
	ReadPersona: ReadPersonaParams;
	CreateAssignment: CreateAssignmentParams;
	DeleteAssignment: DeleteAssignmentParams;
	CreateSpace: CreateSpaceParams;
	ReadSpace: ReadSpaceParams;
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
	Ping: PingParams;
	Ephemera: EphemeraParams;
	ToggleMainNav: ToggleMainNavParams;
	ToggleSecondaryNav: ToggleSecondaryNavParams;
	SetMobile: SetMobileParams;
	OpenDialog: OpenDialogParams;
	CloseDialog: CloseDialogParams;
	ViewSpace: ViewSpaceParams;
	ClearFreshness: ClearFreshnessParams;
}
export interface EventResponseByName {
	Login: LoginResponse;
	Logout: LogoutResponse;
	UpdateAccountSettings: UpdateAccountSettingsResponse;
	CreateCommunity: CreateCommunityResponse;
	ReadCommunity: ReadCommunityResponse;
	ReadCommunities: ReadCommunitiesResponse;
	UpdateCommunitySettings: UpdateCommunitySettingsResponse;
	DeleteCommunity: DeleteCommunityResponse;
	LeaveCommunity: LeaveCommunityResponse;
	CreateAccountPersona: CreateAccountPersonaResponse;
	ReadPersona: ReadPersonaResponse;
	CreateAssignment: CreateAssignmentResponse;
	DeleteAssignment: DeleteAssignmentResponse;
	CreateSpace: CreateSpaceResponse;
	ReadSpace: ReadSpaceResponse;
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
	Ping: PingResponse;
	Ephemera: EphemeraResponse;
}

export interface ServiceByName {
	Ping: NonAuthorizedService<PingParams, PingResponseResult>;
	Ephemera: AuthorizedService<EphemeraParams, EphemeraResponseResult>;
	Login: NonAuthenticatedService<LoginParams, LoginResponseResult>;
	Logout: NonAuthorizedService<LogoutParams, LogoutResponseResult>;
	UpdateAccountSettings: NonAuthorizedService<
		UpdateAccountSettingsParams,
		UpdateAccountSettingsResponseResult
	>;
	CreateAccountPersona: NonAuthorizedService<
		CreateAccountPersonaParams,
		CreateAccountPersonaResponseResult
	>;
	ReadPersona: AuthorizedService<ReadPersonaParams, ReadPersonaResponseResult>;
	ReadCommunity: AuthorizedService<ReadCommunityParams, ReadCommunityResponseResult>;
	ReadCommunities: AuthorizedService<ReadCommunitiesParams, ReadCommunitiesResponseResult>;
	CreateCommunity: AuthorizedService<CreateCommunityParams, CreateCommunityResponseResult>;
	UpdateCommunitySettings: AuthorizedService<
		UpdateCommunitySettingsParams,
		UpdateCommunitySettingsResponseResult
	>;
	DeleteCommunity: AuthorizedService<DeleteCommunityParams, DeleteCommunityResponseResult>;
	LeaveCommunity: AuthorizedService<LeaveCommunityParams, LeaveCommunityResponseResult>;
	CreateAssignment: AuthorizedService<CreateAssignmentParams, CreateAssignmentResponseResult>;
	DeleteAssignment: AuthorizedService<DeleteAssignmentParams, DeleteAssignmentResponseResult>;
	ReadSpace: AuthorizedService<ReadSpaceParams, ReadSpaceResponseResult>;
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
}

export interface SetSessionParams {
	session: ClientSession;
}

export interface LoginParams {
	username: string;
	password: string;
}
export interface LoginResponse {
	session: ClientAccountSession;
}
export type LoginResponseResult = ApiResult<LoginResponse>;

export type LogoutParams = null;
export type LogoutResponse = null;
export type LogoutResponseResult = ApiResult<LogoutResponse>;

export interface UpdateAccountSettingsParams {
	settings: {
		darkmode?: boolean;
	};
}
export type UpdateAccountSettingsResponse = null;
export type UpdateAccountSettingsResponseResult = ApiResult<UpdateAccountSettingsResponse>;

export interface CreateCommunityParams {
	actor: number;
	name: string;
	settings?: {
		hue: number;
	};
}
export interface CreateCommunityResponse {
	community: Community;
	role: Role;
	spaces: Space[];
	directories: (Entity & {data: DirectoryEntityData})[];
	assignments: Assignment[];
	personas: Persona[];
}
export type CreateCommunityResponseResult = ApiResult<CreateCommunityResponse>;

export interface ReadCommunityParams {
	actor: number;
	community_id: number;
}
export interface ReadCommunityResponse {
	community: Community;
	spaces: Space[];
	directories: (Entity & {data: DirectoryEntityData})[];
	roles: Role[];
	assignments: Assignment[];
	personas: Persona[];
}
export type ReadCommunityResponseResult = ApiResult<ReadCommunityResponse>;

export interface ReadCommunitiesParams {
	actor: number;
}
export interface ReadCommunitiesResponse {
	communities: Community[];
}
export type ReadCommunitiesResponseResult = ApiResult<ReadCommunitiesResponse>;

export interface UpdateCommunitySettingsParams {
	actor: number;
	community_id: number;
	settings: {
		hue: number;
		defaultRoleId: number;
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

export interface LeaveCommunityParams {
	actor: number;
	community_id: number;
}
export type LeaveCommunityResponse = null;
export type LeaveCommunityResponseResult = ApiResult<LeaveCommunityResponse>;

export interface CreateAccountPersonaParams {
	name: string;
}
export interface CreateAccountPersonaResponse {
	persona: AccountPersona;
	community: Community;
	role: Role;
	spaces: Space[];
	directories: (Entity & {data: DirectoryEntityData})[];
	assignment: Assignment;
}
export type CreateAccountPersonaResponseResult = ApiResult<CreateAccountPersonaResponse>;

export interface ReadPersonaParams {
	actor: number;
	persona_id: number;
}
export interface ReadPersonaResponse {
	persona: Persona;
}
export type ReadPersonaResponseResult = ApiResult<ReadPersonaResponse>;

export interface CreateAssignmentParams {
	actor: number;
	persona_id: number;
	community_id: number;
}
export interface CreateAssignmentResponse {
	assignment: Assignment;
}
export type CreateAssignmentResponseResult = ApiResult<CreateAssignmentResponse>;

export interface DeleteAssignmentParams {
	actor: number;
	persona_id: number;
	community_id: number;
}
export type DeleteAssignmentResponse = null;
export type DeleteAssignmentResponseResult = ApiResult<DeleteAssignmentResponse>;

export interface CreateSpaceParams {
	actor: number;
	community_id: number;
	name: string;
	url: string;
	icon: string;
	view: string;
}
export interface CreateSpaceResponse {
	space: Space;
	directory: Entity & {data: DirectoryEntityData};
}
export type CreateSpaceResponseResult = ApiResult<CreateSpaceResponse>;

export interface ReadSpaceParams {
	actor: number;
	space_id: number;
}
export interface ReadSpaceResponse {
	space: Space;
	directory: Entity & {data: DirectoryEntityData};
}
export type ReadSpaceResponseResult = ApiResult<ReadSpaceResponse>;

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
	url?: string;
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
	data: EntityData;
	source_id: number;
	type?: string;
}
export interface CreateEntityResponse {
	entity: Entity;
	tie: Tie;
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
	SetSession: (params: SetSessionParams) => void;
	Login: (params: LoginParams) => Promise<LoginResponseResult>;
	Logout: () => Promise<LogoutResponseResult>;
	UpdateAccountSettings: (
		params: UpdateAccountSettingsParams,
	) => Promise<UpdateAccountSettingsResponseResult>;
	CreateCommunity: (params: CreateCommunityParams) => Promise<CreateCommunityResponseResult>;
	ReadCommunity: (params: ReadCommunityParams) => Promise<ReadCommunityResponseResult>;
	ReadCommunities: (params: ReadCommunitiesParams) => Promise<ReadCommunitiesResponseResult>;
	UpdateCommunitySettings: (
		params: UpdateCommunitySettingsParams,
	) => Promise<UpdateCommunitySettingsResponseResult>;
	DeleteCommunity: (params: DeleteCommunityParams) => Promise<DeleteCommunityResponseResult>;
	LeaveCommunity: (params: LeaveCommunityParams) => Promise<LeaveCommunityResponseResult>;
	CreateAccountPersona: (
		params: CreateAccountPersonaParams,
	) => Promise<CreateAccountPersonaResponseResult>;
	ReadPersona: (params: ReadPersonaParams) => Promise<ReadPersonaResponseResult>;
	CreateAssignment: (params: CreateAssignmentParams) => Promise<CreateAssignmentResponseResult>;
	DeleteAssignment: (params: DeleteAssignmentParams) => Promise<DeleteAssignmentResponseResult>;
	CreateSpace: (params: CreateSpaceParams) => Promise<CreateSpaceResponseResult>;
	ReadSpace: (params: ReadSpaceParams) => Promise<ReadSpaceResponseResult>;
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
	Ping: () => Promise<ApiResult<null>>;
	Ephemera: (params: EphemeraParams) => Promise<EphemeraResponseResult>;
	ToggleMainNav: (params: ToggleMainNavParams) => void;
	ToggleSecondaryNav: (params: ToggleSecondaryNavParams) => void;
	SetMobile: (params: SetMobileParams) => void;
	OpenDialog: (params: OpenDialogParams) => void;
	CloseDialog: (params: CloseDialogParams) => void;
	ViewSpace: (params: ViewSpaceParams) => void;
	ClearFreshness: (params: ClearFreshnessParams) => void;
}

export interface Mutations {
	SetSession: (ctx: DispatchContext<SetSessionParams, void>) => void;
	Login: (ctx: DispatchContext<LoginParams, LoginResponseResult>) => Promise<LoginResponseResult>;
	Logout: (
		ctx: DispatchContext<LogoutParams, LogoutResponseResult>,
	) => Promise<LogoutResponseResult>;
	UpdateAccountSettings: (
		ctx: DispatchContext<UpdateAccountSettingsParams, UpdateAccountSettingsResponseResult>,
	) => Promise<UpdateAccountSettingsResponseResult>;
	CreateCommunity: (
		ctx: DispatchContext<CreateCommunityParams, CreateCommunityResponseResult>,
	) => Promise<CreateCommunityResponseResult>;
	ReadCommunity: (
		ctx: DispatchContext<ReadCommunityParams, ReadCommunityResponseResult>,
	) => Promise<ReadCommunityResponseResult>;
	ReadCommunities: (
		ctx: DispatchContext<ReadCommunitiesParams, ReadCommunitiesResponseResult>,
	) => Promise<ReadCommunitiesResponseResult>;
	UpdateCommunitySettings: (
		ctx: DispatchContext<UpdateCommunitySettingsParams, UpdateCommunitySettingsResponseResult>,
	) => Promise<UpdateCommunitySettingsResponseResult>;
	DeleteCommunity: (
		ctx: DispatchContext<DeleteCommunityParams, DeleteCommunityResponseResult>,
	) => Promise<DeleteCommunityResponseResult>;
	LeaveCommunity: (
		ctx: DispatchContext<LeaveCommunityParams, LeaveCommunityResponseResult>,
	) => Promise<LeaveCommunityResponseResult>;
	CreateAccountPersona: (
		ctx: DispatchContext<CreateAccountPersonaParams, CreateAccountPersonaResponseResult>,
	) => Promise<CreateAccountPersonaResponseResult>;
	ReadPersona: (
		ctx: DispatchContext<ReadPersonaParams, ReadPersonaResponseResult>,
	) => Promise<ReadPersonaResponseResult>;
	CreateAssignment: (
		ctx: DispatchContext<CreateAssignmentParams, CreateAssignmentResponseResult>,
	) => Promise<CreateAssignmentResponseResult>;
	DeleteAssignment: (
		ctx: DispatchContext<DeleteAssignmentParams, DeleteAssignmentResponseResult>,
	) => Promise<DeleteAssignmentResponseResult>;
	CreateSpace: (
		ctx: DispatchContext<CreateSpaceParams, CreateSpaceResponseResult>,
	) => Promise<CreateSpaceResponseResult>;
	ReadSpace: (
		ctx: DispatchContext<ReadSpaceParams, ReadSpaceResponseResult>,
	) => Promise<ReadSpaceResponseResult>;
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
	Ping: (ctx: DispatchContext<PingParams, PingResponseResult>) => Promise<ApiResult<null>>;
	Ephemera: (
		ctx: DispatchContext<EphemeraParams, EphemeraResponseResult>,
	) => Promise<EphemeraResponseResult>;
	ToggleMainNav: (ctx: DispatchContext<ToggleMainNavParams, void>) => void;
	ToggleSecondaryNav: (ctx: DispatchContext<ToggleSecondaryNavParams, void>) => void;
	SetMobile: (ctx: DispatchContext<SetMobileParams, void>) => void;
	OpenDialog: (ctx: DispatchContext<OpenDialogParams, void>) => void;
	CloseDialog: (ctx: DispatchContext<CloseDialogParams, void>) => void;
	ViewSpace: (ctx: DispatchContext<ViewSpaceParams, void>) => void;
	ClearFreshness: (ctx: DispatchContext<ClearFreshnessParams, void>) => void;
}

// generated by src/lib/app/eventTypes.gen.ts
