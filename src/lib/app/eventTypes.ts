// generated by src/lib/app/eventTypes.gen.ts

import type {SvelteComponent} from 'svelte';
import type {Readable} from 'svelte/store';

import type {ClientAccountSession} from '$lib/session/clientSession';
import type {ApiResult} from '$lib/server/api';
import type {Community} from '$lib/vocab/community/community';
import type {Persona} from '$lib/vocab/persona/persona';
import type {Membership} from '$lib/vocab/membership/membership';
import type {Space} from '$lib/vocab/space/space';
import type {Entity} from '$lib/vocab/entity/entity';
import type {EntityData} from '$lib/vocab/entity/entityData';
import type {ViewData} from '$lib/vocab/view/view';
import type {DispatchContext} from '$lib/app/dispatch';

export interface EventParamsByName {
	LoginAccount: LoginAccountParams;
	LogoutAccount: LogoutAccountParams;
	CreateCommunity: CreateCommunityParams;
	ReadCommunity: ReadCommunityParams;
	ReadCommunities: ReadCommunitiesParams;
	UpdateCommunitySettings: UpdateCommunitySettingsParams;
	CreatePersona: CreatePersonaParams;
	CreateMembership: CreateMembershipParams;
	DeleteMembership: DeleteMembershipParams;
	CreateSpace: CreateSpaceParams;
	ReadSpace: ReadSpaceParams;
	ReadSpaces: ReadSpacesParams;
	DeleteSpace: DeleteSpaceParams;
	CreateEntity: CreateEntityParams;
	ReadEntities: ReadEntitiesParams;
	QueryEntities: QueryEntitiesParams;
	Ping: PingParams;
	ToggleMainNav: ToggleMainNavParams;
	ToggleSecondaryNav: ToggleSecondaryNavParams;
	SetMobile: SetMobileParams;
	OpenDialog: OpenDialogParams;
	CloseDialog: CloseDialogParams;
	SelectPersona: SelectPersonaParams;
	SelectCommunity: SelectCommunityParams;
	SelectSpace: SelectSpaceParams;
	ViewSpace: ViewSpaceParams;
}
export interface EventResponseByName {
	LoginAccount: LoginAccountResponse;
	LogoutAccount: LogoutAccountResponse;
	CreateCommunity: CreateCommunityResponse;
	ReadCommunity: ReadCommunityResponse;
	ReadCommunities: ReadCommunitiesResponse;
	UpdateCommunitySettings: UpdateCommunitySettingsResponse;
	CreatePersona: CreatePersonaResponse;
	CreateMembership: CreateMembershipResponse;
	DeleteMembership: DeleteMembershipResponse;
	CreateSpace: CreateSpaceResponse;
	ReadSpace: ReadSpaceResponse;
	ReadSpaces: ReadSpacesResponse;
	DeleteSpace: DeleteSpaceResponse;
	CreateEntity: CreateEntityResponse;
	ReadEntities: ReadEntitiesResponse;
	Ping: PingResponse;
}

export interface LoginAccountParams {
	username: string;
	password: string;
}
export interface LoginAccountResponse {
	session: ClientAccountSession;
}
export type LoginAccountResponseResult = ApiResult<LoginAccountResponse>;

export type LogoutAccountParams = void;
export type LogoutAccountResponse = null;
export type LogoutAccountResponseResult = ApiResult<LogoutAccountResponse>;

export interface CreateCommunityParams {
	name: string;
	persona_id: number;
	settings?: {
		hue: number;
	};
}
export interface CreateCommunityResponse {
	community: Community;
	spaces: Space[];
}
export type CreateCommunityResponseResult = ApiResult<CreateCommunityResponse>;

export interface ReadCommunityParams {
	community_id: number;
}
export interface ReadCommunityResponse {
	community: Community;
}
export type ReadCommunityResponseResult = ApiResult<ReadCommunityResponse>;

export interface ReadCommunitiesParams {}
export interface ReadCommunitiesResponse {
	communities: Community[];
}
export type ReadCommunitiesResponseResult = ApiResult<ReadCommunitiesResponse>;

export interface UpdateCommunitySettingsParams {
	community_id: number;
	settings: {
		hue: number;
	};
}
export type UpdateCommunitySettingsResponse = null;
export type UpdateCommunitySettingsResponseResult = ApiResult<UpdateCommunitySettingsResponse>;

export interface CreatePersonaParams {
	name: string;
}
export interface CreatePersonaResponse {
	persona: Persona;
	community: Community;
	spaces: Space[];
}
export type CreatePersonaResponseResult = ApiResult<CreatePersonaResponse>;

export interface CreateMembershipParams {
	persona_id: number;
	community_id: number;
}
export interface CreateMembershipResponse {
	membership: Membership;
}
export type CreateMembershipResponseResult = ApiResult<CreateMembershipResponse>;

export interface DeleteMembershipParams {
	persona_id: number;
	community_id: number;
}
export type DeleteMembershipResponse = null;
export type DeleteMembershipResponseResult = ApiResult<DeleteMembershipResponse>;

export interface CreateSpaceParams {
	community_id: number;
	name: string;
	url: string;
	view: ViewData;
}
export interface CreateSpaceResponse {
	space: Space;
}
export type CreateSpaceResponseResult = ApiResult<CreateSpaceResponse>;

export interface ReadSpaceParams {
	space_id: number;
}
export interface ReadSpaceResponse {
	space: Space;
}
export type ReadSpaceResponseResult = ApiResult<ReadSpaceResponse>;

export interface ReadSpacesParams {
	community_id: number;
}
export interface ReadSpacesResponse {
	spaces: Space[];
}
export type ReadSpacesResponseResult = ApiResult<ReadSpacesResponse>;

export interface DeleteSpaceParams {
	space_id: number;
}
export type DeleteSpaceResponse = null;
export type DeleteSpaceResponseResult = ApiResult<DeleteSpaceResponse>;

export interface CreateEntityParams {
	actor_id: number;
	space_id: number;
	data: EntityData;
}
export interface CreateEntityResponse {
	entity: Entity;
}
export type CreateEntityResponseResult = ApiResult<CreateEntityResponse>;

export interface ReadEntitiesParams {
	space_id: number;
}
export interface ReadEntitiesResponse {
	entities: Entity[];
}
export type ReadEntitiesResponseResult = ApiResult<ReadEntitiesResponse>;

export interface QueryEntitiesParams {
	space_id: number;
}

export type PingParams = void;
export type PingResponse = null;
export type PingResponseResult = ApiResult<PingResponse>;

export type ToggleMainNavParams = void;

export type ToggleSecondaryNavParams = void;

export type SetMobileParams = boolean;

export interface OpenDialogParams {
	Component: typeof SvelteComponent;
	props?: {
		[k: string]: unknown;
	};
}

export type CloseDialogParams = void;

export interface SelectPersonaParams {
	persona_id: number;
}

export interface SelectCommunityParams {
	community_id: number | null;
}

export interface SelectSpaceParams {
	community_id: number;
	space_id: number;
}

export interface ViewSpaceParams {
	space: Readable<Space>;
	view: ViewData | null;
}

export interface Dispatch {
	(eventName: 'LoginAccount', params: LoginAccountParams): Promise<LoginAccountResponseResult>;
	(eventName: 'LogoutAccount', params: LogoutAccountParams): Promise<LogoutAccountResponseResult>;
	(
		eventName: 'CreateCommunity',
		params: CreateCommunityParams,
	): Promise<CreateCommunityResponseResult>;
	(eventName: 'ReadCommunity', params: ReadCommunityParams): Promise<ReadCommunityResponseResult>;
	(
		eventName: 'ReadCommunities',
		params: ReadCommunitiesParams,
	): Promise<ReadCommunitiesResponseResult>;
	(
		eventName: 'UpdateCommunitySettings',
		params: UpdateCommunitySettingsParams,
	): Promise<UpdateCommunitySettingsResponseResult>;
	(eventName: 'CreatePersona', params: CreatePersonaParams): Promise<CreatePersonaResponseResult>;
	(
		eventName: 'CreateMembership',
		params: CreateMembershipParams,
	): Promise<CreateMembershipResponseResult>;
	(
		eventName: 'DeleteMembership',
		params: DeleteMembershipParams,
	): Promise<DeleteMembershipResponseResult>;
	(eventName: 'CreateSpace', params: CreateSpaceParams): Promise<CreateSpaceResponseResult>;
	(eventName: 'ReadSpace', params: ReadSpaceParams): Promise<ReadSpaceResponseResult>;
	(eventName: 'ReadSpaces', params: ReadSpacesParams): Promise<ReadSpacesResponseResult>;
	(eventName: 'DeleteSpace', params: DeleteSpaceParams): Promise<DeleteSpaceResponseResult>;
	(eventName: 'CreateEntity', params: CreateEntityParams): Promise<CreateEntityResponseResult>;
	(eventName: 'ReadEntities', params: ReadEntitiesParams): Promise<ReadEntitiesResponseResult>;
	(eventName: 'QueryEntities', params: QueryEntitiesParams): Readable<Readable<Entity>[]>;
	(eventName: 'Ping', params: PingParams): Promise<ApiResult<null>>;
	(eventName: 'ToggleMainNav', params: ToggleMainNavParams): void;
	(eventName: 'ToggleSecondaryNav', params: ToggleSecondaryNavParams): void;
	(eventName: 'SetMobile', params: SetMobileParams): void;
	(eventName: 'OpenDialog', params: OpenDialogParams): void;
	(eventName: 'CloseDialog', params: CloseDialogParams): void;
	(eventName: 'SelectPersona', params: SelectPersonaParams): void;
	(eventName: 'SelectCommunity', params: SelectCommunityParams): void;
	(eventName: 'SelectSpace', params: SelectSpaceParams): void;
	(eventName: 'ViewSpace', params: ViewSpaceParams): void;
}

export interface UiHandlers {
	LoginAccount: (
		ctx: DispatchContext<LoginAccountParams, LoginAccountResponseResult>,
	) => Promise<LoginAccountResponseResult>;
	LogoutAccount: (
		ctx: DispatchContext<LogoutAccountParams, LogoutAccountResponseResult>,
	) => Promise<LogoutAccountResponseResult>;
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
	CreatePersona: (
		ctx: DispatchContext<CreatePersonaParams, CreatePersonaResponseResult>,
	) => Promise<CreatePersonaResponseResult>;
	CreateMembership: (
		ctx: DispatchContext<CreateMembershipParams, CreateMembershipResponseResult>,
	) => Promise<CreateMembershipResponseResult>;
	DeleteMembership: (
		ctx: DispatchContext<DeleteMembershipParams, DeleteMembershipResponseResult>,
	) => Promise<DeleteMembershipResponseResult>;
	CreateSpace: (
		ctx: DispatchContext<CreateSpaceParams, CreateSpaceResponseResult>,
	) => Promise<CreateSpaceResponseResult>;
	ReadSpace: (
		ctx: DispatchContext<ReadSpaceParams, ReadSpaceResponseResult>,
	) => Promise<ReadSpaceResponseResult>;
	ReadSpaces: (
		ctx: DispatchContext<ReadSpacesParams, ReadSpacesResponseResult>,
	) => Promise<ReadSpacesResponseResult>;
	DeleteSpace: (
		ctx: DispatchContext<DeleteSpaceParams, DeleteSpaceResponseResult>,
	) => Promise<DeleteSpaceResponseResult>;
	CreateEntity: (
		ctx: DispatchContext<CreateEntityParams, CreateEntityResponseResult>,
	) => Promise<CreateEntityResponseResult>;
	ReadEntities: (
		ctx: DispatchContext<ReadEntitiesParams, ReadEntitiesResponseResult>,
	) => Promise<ReadEntitiesResponseResult>;
	QueryEntities: (ctx: DispatchContext<QueryEntitiesParams, void>) => Readable<Readable<Entity>[]>;
	Ping: (ctx: DispatchContext<PingParams, PingResponseResult>) => Promise<ApiResult<null>>;
	ToggleMainNav: (ctx: DispatchContext<ToggleMainNavParams, void>) => void;
	ToggleSecondaryNav: (ctx: DispatchContext<ToggleSecondaryNavParams, void>) => void;
	SetMobile: (ctx: DispatchContext<SetMobileParams, void>) => void;
	OpenDialog: (ctx: DispatchContext<OpenDialogParams, void>) => void;
	CloseDialog: (ctx: DispatchContext<CloseDialogParams, void>) => void;
	SelectPersona: (ctx: DispatchContext<SelectPersonaParams, void>) => void;
	SelectCommunity: (ctx: DispatchContext<SelectCommunityParams, void>) => void;
	SelectSpace: (ctx: DispatchContext<SelectSpaceParams, void>) => void;
	ViewSpace: (ctx: DispatchContext<ViewSpaceParams, void>) => void;
}

// generated by src/lib/app/eventTypes.gen.ts
