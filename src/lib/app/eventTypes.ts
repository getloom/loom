// generated by src/lib/app/eventTypes.gen.ts

import type {SvelteComponent} from 'svelte';
import type {Readable} from 'svelte/store';

import type {ClientAccountSession} from '$lib/session/clientSession';
import type {ApiResult} from '$lib/server/api';
import type {Community} from '$lib/vocab/community/community';
import type {Persona, AccountPersona} from '$lib/vocab/persona/persona';
import type {Membership} from '$lib/vocab/membership/membership';
import type {Space} from '$lib/vocab/space/space';
import type {Entity} from '$lib/vocab/entity/entity';
import type {Tie} from '$lib/vocab/tie/tie';
import type {EntityData} from '$lib/vocab/entity/entityData';
import type {ViewData} from '$lib/vocab/view/view';
import type {DispatchContext} from '$lib/app/dispatch';

/* eslint-disable @typescript-eslint/no-empty-interface, @typescript-eslint/array-type */

export interface EventParamsByName {
	LoginAccount: LoginAccountParams;
	LogoutAccount: LogoutAccountParams;
	CreateCommunity: CreateCommunityParams;
	ReadCommunity: ReadCommunityParams;
	ReadCommunities: ReadCommunitiesParams;
	UpdateCommunitySettings: UpdateCommunitySettingsParams;
	DeleteCommunity: DeleteCommunityParams;
	CreateAccountPersona: CreateAccountPersonaParams;
	CreateMembership: CreateMembershipParams;
	DeleteMembership: DeleteMembershipParams;
	CreateSpace: CreateSpaceParams;
	ReadSpace: ReadSpaceParams;
	ReadSpaces: ReadSpacesParams;
	UpdateSpace: UpdateSpaceParams;
	DeleteSpace: DeleteSpaceParams;
	CreateEntity: CreateEntityParams;
	ReadEntities: ReadEntitiesParams;
	UpdateEntity: UpdateEntityParams;
	QueryEntities: QueryEntitiesParams;
	SoftDeleteEntity: SoftDeleteEntityParams;
	HardDeleteEntity: HardDeleteEntityParams;
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
	CreateTie: CreateTieParams;
	ReadTies: ReadTiesParams;
	DeleteTie: DeleteTieParams;
}
export interface EventResponseByName {
	LoginAccount: LoginAccountResponse;
	LogoutAccount: LogoutAccountResponse;
	CreateCommunity: CreateCommunityResponse;
	ReadCommunity: ReadCommunityResponse;
	ReadCommunities: ReadCommunitiesResponse;
	UpdateCommunitySettings: UpdateCommunitySettingsResponse;
	DeleteCommunity: DeleteCommunityResponse;
	CreateAccountPersona: CreateAccountPersonaResponse;
	CreateMembership: CreateMembershipResponse;
	DeleteMembership: DeleteMembershipResponse;
	CreateSpace: CreateSpaceResponse;
	ReadSpace: ReadSpaceResponse;
	ReadSpaces: ReadSpacesResponse;
	UpdateSpace: UpdateSpaceResponse;
	DeleteSpace: DeleteSpaceResponse;
	CreateEntity: CreateEntityResponse;
	ReadEntities: ReadEntitiesResponse;
	UpdateEntity: UpdateEntityResponse;
	SoftDeleteEntity: SoftDeleteEntityResponse;
	HardDeleteEntity: HardDeleteEntityResponse;
	Ping: PingResponse;
	CreateTie: CreateTieResponse;
	ReadTies: ReadTiesResponse;
	DeleteTie: DeleteTieResponse;
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
	memberships: Membership[];
	communityPersona: Persona;
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

export interface DeleteCommunityParams {
	community_id: number;
}
export type DeleteCommunityResponse = null;
export type DeleteCommunityResponseResult = ApiResult<DeleteCommunityResponse>;

export interface CreateAccountPersonaParams {
	name: string;
}
export interface CreateAccountPersonaResponse {
	persona: AccountPersona;
	community: Community;
	spaces: Space[];
	membership: Membership;
}
export type CreateAccountPersonaResponseResult = ApiResult<CreateAccountPersonaResponse>;

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
	icon: string;
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

export interface UpdateSpaceParams {
	space_id: number;
	name?: string;
	url?: string;
	icon?: string;
	view?: ViewData;
}
export interface UpdateSpaceResponse {
	space: Space;
}
export type UpdateSpaceResponseResult = ApiResult<UpdateSpaceResponse>;

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

export interface UpdateEntityParams {
	entity_id: number;
	data: EntityData;
}
export interface UpdateEntityResponse {
	entity: Entity;
}
export type UpdateEntityResponseResult = ApiResult<UpdateEntityResponse>;

export interface QueryEntitiesParams {
	space_id: number;
}

export interface SoftDeleteEntityParams {
	entity_id: number;
}
export type SoftDeleteEntityResponse = null;
export type SoftDeleteEntityResponseResult = ApiResult<SoftDeleteEntityResponse>;

export interface HardDeleteEntityParams {
	entity_id: number;
}
export type HardDeleteEntityResponse = null;
export type HardDeleteEntityResponseResult = ApiResult<HardDeleteEntityResponse>;

export type PingParams = void;
export type PingResponse = null;
export type PingResponseResult = ApiResult<PingResponse>;

export type ToggleMainNavParams = void;

export type ToggleSecondaryNavParams = void;

export type SetMobileParams = boolean;

export type OpenDialogParams = {
	Component: typeof SvelteComponent;
	props?: {
		[k: string]: unknown;
	};
	dialogProps?: {
		[k: string]: unknown;
	};
};

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

export interface CreateTieParams {
	source_id: number;
	dest_id: number;
	type: string;
}
export interface CreateTieResponse {
	tie: Tie;
}
export type CreateTieResponseResult = ApiResult<CreateTieResponse>;

export interface ReadTiesParams {
	space_id: number;
}
export interface ReadTiesResponse {
	ties: Tie[];
}
export type ReadTiesResponseResult = ApiResult<ReadTiesResponse>;

export interface DeleteTieParams {
	source_id: number;
	dest_id: number;
	type: string;
}
export type DeleteTieResponse = null;
export type DeleteTieResponseResult = ApiResult<DeleteTieResponse>;

export interface Dispatch {
	LoginAccount: (params: LoginAccountParams) => Promise<LoginAccountResponseResult>;
	LogoutAccount: (params: LogoutAccountParams) => Promise<LogoutAccountResponseResult>;
	CreateCommunity: (params: CreateCommunityParams) => Promise<CreateCommunityResponseResult>;
	ReadCommunity: (params: ReadCommunityParams) => Promise<ReadCommunityResponseResult>;
	ReadCommunities: (params: ReadCommunitiesParams) => Promise<ReadCommunitiesResponseResult>;
	UpdateCommunitySettings: (
		params: UpdateCommunitySettingsParams,
	) => Promise<UpdateCommunitySettingsResponseResult>;
	DeleteCommunity: (params: DeleteCommunityParams) => Promise<DeleteCommunityResponseResult>;
	CreateAccountPersona: (
		params: CreateAccountPersonaParams,
	) => Promise<CreateAccountPersonaResponseResult>;
	CreateMembership: (params: CreateMembershipParams) => Promise<CreateMembershipResponseResult>;
	DeleteMembership: (params: DeleteMembershipParams) => Promise<DeleteMembershipResponseResult>;
	CreateSpace: (params: CreateSpaceParams) => Promise<CreateSpaceResponseResult>;
	ReadSpace: (params: ReadSpaceParams) => Promise<ReadSpaceResponseResult>;
	ReadSpaces: (params: ReadSpacesParams) => Promise<ReadSpacesResponseResult>;
	UpdateSpace: (params: UpdateSpaceParams) => Promise<UpdateSpaceResponseResult>;
	DeleteSpace: (params: DeleteSpaceParams) => Promise<DeleteSpaceResponseResult>;
	CreateEntity: (params: CreateEntityParams) => Promise<CreateEntityResponseResult>;
	ReadEntities: (params: ReadEntitiesParams) => Promise<ReadEntitiesResponseResult>;
	UpdateEntity: (params: UpdateEntityParams) => Promise<UpdateEntityResponseResult>;
	QueryEntities: (params: QueryEntitiesParams) => Readable<Readable<Entity>[]>;
	SoftDeleteEntity: (params: SoftDeleteEntityParams) => Promise<SoftDeleteEntityResponseResult>;
	HardDeleteEntity: (params: HardDeleteEntityParams) => Promise<HardDeleteEntityResponseResult>;
	Ping: (params: PingParams) => Promise<ApiResult<null>>;
	ToggleMainNav: (params: ToggleMainNavParams) => void;
	ToggleSecondaryNav: (params: ToggleSecondaryNavParams) => void;
	SetMobile: (params: SetMobileParams) => void;
	OpenDialog: (params: OpenDialogParams) => void;
	CloseDialog: (params: CloseDialogParams) => void;
	SelectPersona: (params: SelectPersonaParams) => void;
	SelectCommunity: (params: SelectCommunityParams) => void;
	SelectSpace: (params: SelectSpaceParams) => void;
	ViewSpace: (params: ViewSpaceParams) => void;
	CreateTie: (params: CreateTieParams) => Promise<CreateTieResponseResult>;
	ReadTies: (params: ReadTiesParams) => Promise<ReadTiesResponseResult>;
	DeleteTie: (params: DeleteTieParams) => Promise<DeleteTieResponseResult>;
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
	DeleteCommunity: (
		ctx: DispatchContext<DeleteCommunityParams, DeleteCommunityResponseResult>,
	) => Promise<DeleteCommunityResponseResult>;
	CreateAccountPersona: (
		ctx: DispatchContext<CreateAccountPersonaParams, CreateAccountPersonaResponseResult>,
	) => Promise<CreateAccountPersonaResponseResult>;
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
	UpdateSpace: (
		ctx: DispatchContext<UpdateSpaceParams, UpdateSpaceResponseResult>,
	) => Promise<UpdateSpaceResponseResult>;
	DeleteSpace: (
		ctx: DispatchContext<DeleteSpaceParams, DeleteSpaceResponseResult>,
	) => Promise<DeleteSpaceResponseResult>;
	CreateEntity: (
		ctx: DispatchContext<CreateEntityParams, CreateEntityResponseResult>,
	) => Promise<CreateEntityResponseResult>;
	ReadEntities: (
		ctx: DispatchContext<ReadEntitiesParams, ReadEntitiesResponseResult>,
	) => Promise<ReadEntitiesResponseResult>;
	UpdateEntity: (
		ctx: DispatchContext<UpdateEntityParams, UpdateEntityResponseResult>,
	) => Promise<UpdateEntityResponseResult>;
	QueryEntities: (ctx: DispatchContext<QueryEntitiesParams, void>) => Readable<Readable<Entity>[]>;
	SoftDeleteEntity: (
		ctx: DispatchContext<SoftDeleteEntityParams, SoftDeleteEntityResponseResult>,
	) => Promise<SoftDeleteEntityResponseResult>;
	HardDeleteEntity: (
		ctx: DispatchContext<HardDeleteEntityParams, HardDeleteEntityResponseResult>,
	) => Promise<HardDeleteEntityResponseResult>;
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
	CreateTie: (
		ctx: DispatchContext<CreateTieParams, CreateTieResponseResult>,
	) => Promise<CreateTieResponseResult>;
	ReadTies: (
		ctx: DispatchContext<ReadTiesParams, ReadTiesResponseResult>,
	) => Promise<ReadTiesResponseResult>;
	DeleteTie: (
		ctx: DispatchContext<DeleteTieParams, DeleteTieResponseResult>,
	) => Promise<DeleteTieResponseResult>;
}

// generated by src/lib/app/eventTypes.gen.ts
