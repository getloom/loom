// generated by src/lib/app/eventTypes.gen.ts

import type {SvelteComponent} from 'svelte';

import type {ApiResult} from '$lib/server/api';
import type {Query} from '$lib/util/query';
import type {
	NonAuthenticatedService,
	NonAuthorizedService,
	AuthorizedService,
} from '$lib/server/service';
import type {Hub, HubSettings} from '$lib/vocab/hub/hub';
import type {PublicPersona, ClientPersona} from '$lib/vocab/persona/persona';
import type {Assignment} from '$lib/vocab/assignment/assignment';
import type {Space} from '$lib/vocab/space/space';
import type {Entity} from '$lib/vocab/entity/entity';
import type {EntityData, Directory} from '$lib/vocab/entity/entityData';
import type {Tie} from '$lib/vocab/tie/tie';
import type {Role} from '$lib/vocab/role/role';
import type {Policy} from '$lib/vocab/policy/policy';
import type {DispatchContext} from '$lib/app/dispatch';
import type {
	ClientSession,
	ClientAccountSession,
	AccountSettings,
	ClientAccount,
} from '$lib/vocab/account/account';
import type {HubTemplate} from '$lib/app/templates';

/* eslint-disable @typescript-eslint/array-type */

export type ServiceEventName =
	| 'SignUp'
	| 'SignIn'
	| 'SignOut'
	| 'UpdateAccountSettings'
	| 'UpdateAccountPassword'
	| 'CreateHub'
	| 'ReadHub'
	| 'UpdateHubSettings'
	| 'DeleteHub'
	| 'InviteToHub'
	| 'LeaveHub'
	| 'KickFromHub'
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
	CreateHub: CreateHubParams;
	ReadHub: ReadHubParams;
	UpdateHubSettings: UpdateHubSettingsParams;
	DeleteHub: DeleteHubParams;
	InviteToHub: InviteToHubParams;
	LeaveHub: LeaveHubParams;
	KickFromHub: KickFromHubParams;
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
	CreateHub: CreateHubResponse;
	ReadHub: ReadHubResponse;
	UpdateHubSettings: UpdateHubSettingsResponse;
	DeleteHub: DeleteHubResponse;
	InviteToHub: InviteToHubResponse;
	LeaveHub: LeaveHubResponse;
	KickFromHub: KickFromHubResponse;
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
	ReadHub: AuthorizedService<ReadHubParams, ReadHubResponseResult>;
	CreateHub: AuthorizedService<CreateHubParams, CreateHubResponseResult>;
	UpdateHubSettings: AuthorizedService<UpdateHubSettingsParams, UpdateHubSettingsResponseResult>;
	DeleteHub: AuthorizedService<DeleteHubParams, DeleteHubResponseResult>;
	InviteToHub: AuthorizedService<InviteToHubParams, InviteToHubResponseResult>;
	LeaveHub: AuthorizedService<LeaveHubParams, LeaveHubResponseResult>;
	KickFromHub: AuthorizedService<KickFromHubParams, KickFromHubResponseResult>;
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
	settings: AccountSettings;
}
/**
 *
 * 		A client-facing subset of an Account. Excludes 'password' for security.
 *
 */
export type UpdateAccountSettingsResponse = ClientAccount;
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
export type UpdateAccountPasswordResponse = ClientAccount;
export type UpdateAccountPasswordResponseResult = ApiResult<UpdateAccountPasswordResponse>;

export interface CreateHubParams {
	actor: number;
	template: HubTemplate;
}
export interface CreateHubResponse {
	/**
	 *
	 * 		Hubs represent the membrane around the places Personas can interact with each other or with system level data.
	 * 		They have self contained governance and ownership of Spaces within them.
	 * 		By default they are hidden & undiscoverable and are only visible to a user once a Persona has been invited in.
	 *
	 */
	hub: Hub;
	roles: Role[];
	spaces: Space[];
	directories: Directory[];
	assignments: Assignment[];
	policies: Policy[];
	personas: PublicPersona[];
}
export type CreateHubResponseResult = ApiResult<CreateHubResponse>;

export interface ReadHubParams {
	actor: number;
	hub_id: number;
}
export interface ReadHubResponse {
	/**
	 *
	 * 		Hubs represent the membrane around the places Personas can interact with each other or with system level data.
	 * 		They have self contained governance and ownership of Spaces within them.
	 * 		By default they are hidden & undiscoverable and are only visible to a user once a Persona has been invited in.
	 *
	 */
	hub: Hub;
	spaces: Space[];
	directories: Directory[];
	roles: Role[];
	assignments: Assignment[];
	personas: PublicPersona[];
}
export type ReadHubResponseResult = ApiResult<ReadHubResponse>;

export interface UpdateHubSettingsParams {
	actor: number;
	hub_id: number;
	/**
	 *
	 * 		A nested set of attributes on Hub. Holds all hub level settings.
	 *
	 */
	settings: HubSettings;
}
export type UpdateHubSettingsResponse = null;
export type UpdateHubSettingsResponseResult = ApiResult<UpdateHubSettingsResponse>;

export interface DeleteHubParams {
	actor: number;
	hub_id: number;
}
export type DeleteHubResponse = null;
export type DeleteHubResponseResult = ApiResult<DeleteHubResponse>;

export interface InviteToHubParams {
	actor: number;
	hub_id: number;
	name: string;
}
export interface InviteToHubResponse {
	/**
	 *
	 * 		A subset of a Persona available to all clients in a hub.
	 *
	 */
	persona: PublicPersona;
	/**
	 *
	 * 	 Describes the relationship between a Persona and Role within a given Hub.
	 * 	 A Persona must have at least 1 assignment to be in a Hub and see it in the nav.
	 * 	 When initially joining a Hub, Personas are given an Assignment to the default Role.
	 *
	 */
	assignment: Assignment;
}
export type InviteToHubResponseResult = ApiResult<InviteToHubResponse>;

export interface LeaveHubParams {
	actor: number;
	persona_id: number;
	hub_id: number;
}
export type LeaveHubResponse = null;
export type LeaveHubResponseResult = ApiResult<LeaveHubResponse>;

export interface KickFromHubParams {
	actor: number;
	persona_id: number;
	hub_id: number;
}
export type KickFromHubResponse = null;
export type KickFromHubResponseResult = ApiResult<KickFromHubResponse>;

export interface CreateAccountPersonaParams {
	name: string;
}
export interface CreateAccountPersonaResponse {
	personas: ClientPersona[];
	hubs: Hub[];
	roles: Role[];
	policies: Policy[];
	spaces: Space[];
	directories: Directory[];
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
	hub_id: number;
	role_id: number;
}
export interface CreateAssignmentResponse {
	/**
	 *
	 * 	 Describes the relationship between a Persona and Role within a given Hub.
	 * 	 A Persona must have at least 1 assignment to be in a Hub and see it in the nav.
	 * 	 When initially joining a Hub, Personas are given an Assignment to the default Role.
	 *
	 */
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
	hub_id: number;
	name: string;
	path: string;
	icon: string;
	view: string;
}
export interface CreateSpaceResponse {
	/**
	 *
	 * 	 Spaces are subdivisions within a Hub that hold a View and reference to an Entity directory.
	 * 	 The View is used to interpret, visualize, and manipulate the Entities connected to the directory.
	 * 	 Each is a Svelte component that conforms to the View interface.
	 *
	 */
	space: Space;
	/**
	 *
	 * 		An Entity is the core data type that represents an ActivityStreams object in the system.
	 * 		Each has an "owning" space & persona that controls its governance.
	 * 		Entities exist within a graph architecture, with Ties serving as the paths between nodes.
	 * 		Conventionally, all entities within a given Space can be found by traversing
	 * 		the graph starting at the directory Entity associated with the owning Space.
	 * 		A directory is an ActivityStreams Collection referenced by each Space.
	 *
	 */
	directory: Directory;
}
export type CreateSpaceResponseResult = ApiResult<CreateSpaceResponse>;

export interface ReadSpacesParams {
	actor: number;
	hub_id: number;
}
export interface ReadSpacesResponse {
	spaces: Space[];
	directories: Directory[];
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
	/**
	 *
	 * 	 Spaces are subdivisions within a Hub that hold a View and reference to an Entity directory.
	 * 	 The View is used to interpret, visualize, and manipulate the Entities connected to the directory.
	 * 	 Each is a Svelte component that conforms to the View interface.
	 *
	 */
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
	path?: string | null;
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
	data?: EntityData;
	path?: string | null;
}
export interface UpdateEntityResponse {
	/**
	 *
	 * 		An Entity is the core data type that represents an ActivityStreams object in the system.
	 * 		Each has an "owning" space & persona that controls its governance.
	 * 		Entities exist within a graph architecture, with Ties serving as the paths between nodes.
	 * 		Conventionally, all entities within a given Space can be found by traversing
	 * 		the graph starting at the directory Entity associated with the owning Space.
	 * 		A directory is an ActivityStreams Collection referenced by each Space.
	 *
	 */
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

export interface CreateRoleParams {
	actor: number;
	hub_id: number;
	name: string;
}
export interface CreateRoleResponse {
	/**
	 *
	 * 		Roles are user-defined governance objects that exist within the context of a single Hub.
	 * 		They have Policies associated with them that allow for actions to be taken within the system.
	 * 		When a Persona has a Role via an Assignment, that actor may take any action allowed by the Role's Policies.
	 *
	 */
	role: Role;
}
export type CreateRoleResponseResult = ApiResult<CreateRoleResponse>;

export interface ReadRolesParams {
	actor: number;
	hub_id: number;
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
	/**
	 *
	 * 		Roles are user-defined governance objects that exist within the context of a single Hub.
	 * 		They have Policies associated with them that allow for actions to be taken within the system.
	 * 		When a Persona has a Role via an Assignment, that actor may take any action allowed by the Role's Policies.
	 *
	 */
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
	/**
	 *
	 * 		Policies are associated with Roles to describe the actions a Role is able to take with the system.
	 * 		Permissions are the enumeration of the those actions, often 1:1 with system Events.
	 * 		Data is a currently-unused attribute earmarked for allowing for more complicated governance schemes.
	 *
	 */
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
	/**
	 *
	 * 		Policies are associated with Roles to describe the actions a Role is able to take with the system.
	 * 		Permissions are the enumeration of the those actions, often 1:1 with system Events.
	 * 		Data is a currently-unused attribute earmarked for allowing for more complicated governance schemes.
	 *
	 */
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
	/**
	 *
	 * 		The session data loaded on each page for authenticated and unauthenticated users.
	 *
	 */
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
	CreateHub: (params: CreateHubParams) => Promise<CreateHubResponseResult>;
	ReadHub: (params: ReadHubParams) => Promise<ReadHubResponseResult>;
	UpdateHubSettings: (params: UpdateHubSettingsParams) => Promise<UpdateHubSettingsResponseResult>;
	DeleteHub: (params: DeleteHubParams) => Promise<DeleteHubResponseResult>;
	InviteToHub: (params: InviteToHubParams) => Promise<InviteToHubResponseResult>;
	LeaveHub: (params: LeaveHubParams) => Promise<LeaveHubResponseResult>;
	KickFromHub: (params: KickFromHubParams) => Promise<KickFromHubResponseResult>;
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
	QueryEntities: (params: QueryEntitiesParams) => Query;
	EraseEntities: (params: EraseEntitiesParams) => Promise<EraseEntitiesResponseResult>;
	DeleteEntities: (params: DeleteEntitiesParams) => Promise<DeleteEntitiesResponseResult>;
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
	CreateHub: (
		ctx: DispatchContext<CreateHubParams, CreateHubResponseResult>,
	) => Promise<CreateHubResponseResult>;
	ReadHub: (
		ctx: DispatchContext<ReadHubParams, ReadHubResponseResult>,
	) => Promise<ReadHubResponseResult>;
	UpdateHubSettings: (
		ctx: DispatchContext<UpdateHubSettingsParams, UpdateHubSettingsResponseResult>,
	) => Promise<UpdateHubSettingsResponseResult>;
	DeleteHub: (
		ctx: DispatchContext<DeleteHubParams, DeleteHubResponseResult>,
	) => Promise<DeleteHubResponseResult>;
	InviteToHub: (
		ctx: DispatchContext<InviteToHubParams, InviteToHubResponseResult>,
	) => Promise<InviteToHubResponseResult>;
	LeaveHub: (
		ctx: DispatchContext<LeaveHubParams, LeaveHubResponseResult>,
	) => Promise<LeaveHubResponseResult>;
	KickFromHub: (
		ctx: DispatchContext<KickFromHubParams, KickFromHubResponseResult>,
	) => Promise<KickFromHubResponseResult>;
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
	QueryEntities: (ctx: DispatchContext<QueryEntitiesParams, void>) => Query;
	EraseEntities: (
		ctx: DispatchContext<EraseEntitiesParams, EraseEntitiesResponseResult>,
	) => Promise<EraseEntitiesResponseResult>;
	DeleteEntities: (
		ctx: DispatchContext<DeleteEntitiesParams, DeleteEntitiesResponseResult>,
	) => Promise<DeleteEntitiesResponseResult>;
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
