import type {EntityId, Entity} from '$lib/vocab/entity/entity';
import type {ClientActor, ActorId, PublicActor} from '$lib/vocab/actor/actor';
import type {Hub, HubId, HubSettings} from '$lib/vocab/hub/hub';
import type {Role, RoleId} from '$lib/vocab/role/role';
import type {Policy, PolicyName, PolicyId} from '$lib/vocab/policy/policy';
import type {Space, SpaceId} from '$lib/vocab/space/space';
import type {Directory, EntityData} from '$lib/vocab/entity/entityData.js';
import type {Assignment, AssignmentId} from '$lib/vocab/assignment/assignment';
import type {Tie} from '$lib/vocab/tie/tie';
import type {Invite} from '$lib/vocab/invite/invite';
import type {Dialog_Params} from '@ryanatkn/fuz/dialog.js';
import type {
	ClientSession,
	ClientAccountSession,
	ClientAccount,
	AccountSettings,
} from '$lib/vocab/account/account';
import type {ApiResult} from '$lib/server/api.js';
import type {
	NonAuthenticatedService,
	NonAuthorizedService,
	AuthorizedService,
} from '$lib/server/service.js';
import type {MutationContext} from '$lib/util/mutation.js';
import type {HubTemplate} from '$lib/ui/templates.js';
import type {Flavored} from '@ryanatkn/belt/types.js'; // TODO something is buggy here, shouldn't be needed

/* eslint-disable @typescript-eslint/array-type */

export type ServiceActionName =
	| 'CreateAccountActor'
	| 'CreateAssignment'
	| 'CreateEntity'
	| 'CreateHub'
	| 'CreateInvite'
	| 'CreatePolicy'
	| 'CreateRole'
	| 'CreateSpace'
	| 'DeleteActor'
	| 'DeleteAssignment'
	| 'DeleteEntities'
	| 'DeleteHub'
	| 'DeletePolicy'
	| 'DeleteRole'
	| 'DeleteSpace'
	| 'Ephemera'
	| 'EraseEntities'
	| 'InviteToHub'
	| 'KickFromHub'
	| 'LeaveHub'
	| 'Ping'
	| 'ReadEntities'
	| 'ReadEntitiesById'
	| 'ReadHub'
	| 'ReadPolicies'
	| 'ReadRoles'
	| 'ReadSpaces'
	| 'SignIn'
	| 'SignOut'
	| 'SignUp'
	| 'UpdateAccountPassword'
	| 'UpdateAccountSettings'
	| 'UpdateEntities'
	| 'UpdateHub'
	| 'UpdatePolicy'
	| 'UpdateRole'
	| 'UpdateSpace'
	| 'RunTask';

export type ClientActionName =
	| 'ClearFreshness'
	| 'CloseDialog'
	| 'OpenDialog'
	| 'SetMobile'
	| 'SetSession'
	| 'ToggleMainNav'
	| 'ToggleSecondaryNav'
	| 'ViewSpace';

export interface ActionParamsByName {
	ClearFreshness: ClearFreshnessParams;
	CloseDialog: CloseDialogParams;
	CreateAccountActor: CreateAccountActorParams;
	CreateAssignment: CreateAssignmentParams;
	CreateEntity: CreateEntityParams;
	CreateHub: CreateHubParams;
	CreateInvite: CreateInviteParams;
	CreatePolicy: CreatePolicyParams;
	CreateRole: CreateRoleParams;
	CreateSpace: CreateSpaceParams;
	DeleteActor: DeleteActorParams;
	DeleteAssignment: DeleteAssignmentParams;
	DeleteEntities: DeleteEntitiesParams;
	DeleteHub: DeleteHubParams;
	DeletePolicy: DeletePolicyParams;
	DeleteRole: DeleteRoleParams;
	DeleteSpace: DeleteSpaceParams;
	Ephemera: EphemeraParams;
	EraseEntities: EraseEntitiesParams;
	InviteToHub: InviteToHubParams;
	KickFromHub: KickFromHubParams;
	LeaveHub: LeaveHubParams;
	OpenDialog: OpenDialogParams;
	Ping: PingParams;
	ReadEntities: ReadEntitiesParams;
	ReadEntitiesById: ReadEntitiesByIdParams;
	ReadHub: ReadHubParams;
	ReadPolicies: ReadPoliciesParams;
	ReadRoles: ReadRolesParams;
	ReadSpaces: ReadSpacesParams;
	SetMobile: SetMobileParams;
	SetSession: SetSessionParams;
	SignIn: SignInParams;
	SignOut: SignOutParams;
	SignUp: SignUpParams;
	ToggleMainNav: ToggleMainNavParams;
	ToggleSecondaryNav: ToggleSecondaryNavParams;
	UpdateAccountPassword: UpdateAccountPasswordParams;
	UpdateAccountSettings: UpdateAccountSettingsParams;
	UpdateEntities: UpdateEntitiesParams;
	UpdateHub: UpdateHubParams;
	UpdatePolicy: UpdatePolicyParams;
	UpdateRole: UpdateRoleParams;
	UpdateSpace: UpdateSpaceParams;
	ViewSpace: ViewSpaceParams;
}
export interface ActionResponseByName {
	CreateAccountActor: CreateAccountActorResponse;
	CreateAssignment: CreateAssignmentResponse;
	CreateEntity: CreateEntityResponse;
	CreateHub: CreateHubResponse;
	CreateInvite: CreateInviteResponse;
	CreatePolicy: CreatePolicyResponse;
	CreateRole: CreateRoleResponse;
	CreateSpace: CreateSpaceResponse;
	DeleteActor: DeleteActorResponse;
	DeleteAssignment: DeleteAssignmentResponse;
	DeleteEntities: DeleteEntitiesResponse;
	DeleteHub: DeleteHubResponse;
	DeletePolicy: DeletePolicyResponse;
	DeleteRole: DeleteRoleResponse;
	DeleteSpace: DeleteSpaceResponse;
	Ephemera: EphemeraResponse;
	EraseEntities: EraseEntitiesResponse;
	InviteToHub: InviteToHubResponse;
	KickFromHub: KickFromHubResponse;
	LeaveHub: LeaveHubResponse;
	Ping: PingResponse;
	ReadEntities: ReadEntitiesResponse;
	ReadEntitiesById: ReadEntitiesByIdResponse;
	ReadHub: ReadHubResponse;
	ReadPolicies: ReadPoliciesResponse;
	ReadRoles: ReadRolesResponse;
	ReadSpaces: ReadSpacesResponse;
	SignIn: SignInResponse;
	SignOut: SignOutResponse;
	SignUp: SignUpResponse;
	UpdateAccountPassword: UpdateAccountPasswordResponse;
	UpdateAccountSettings: UpdateAccountSettingsResponse;
	UpdateEntities: UpdateEntitiesResponse;
	UpdateHub: UpdateHubResponse;
	UpdatePolicy: UpdatePolicyResponse;
	UpdateRole: UpdateRoleResponse;
	UpdateSpace: UpdateSpaceResponse;
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
	CreateAccountActor: NonAuthorizedService<
		CreateAccountActorParams,
		CreateAccountActorResponseResult
	>;
	DeleteActor: AuthorizedService<DeleteActorParams, DeleteActorResponseResult>;
	ReadHub: AuthorizedService<ReadHubParams, ReadHubResponseResult>;
	CreateHub: AuthorizedService<CreateHubParams, CreateHubResponseResult>;
	CreateInvite: NonAuthorizedService<CreateInviteParams, CreateInviteResponseResult>;
	UpdateHub: AuthorizedService<UpdateHubParams, UpdateHubResponseResult>;
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
	ReadEntitiesById: AuthorizedService<ReadEntitiesByIdParams, ReadEntitiesByIdResponseResult>;
	CreateEntity: AuthorizedService<CreateEntityParams, CreateEntityResponseResult>;
	UpdateEntities: AuthorizedService<UpdateEntitiesParams, UpdateEntitiesResponseResult>;
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
	RunTask: AuthorizedService<RunTaskParams, RunTaskResponseResult>;
}

export interface ClearFreshnessParams {
	directory_id: EntityId;
}

export type CloseDialogParams = void;

export interface CreateAccountActorParams {
	name: string;
}
export interface CreateAccountActorResponse {
	actors: ClientActor[];
	hubs: Hub[];
	roles: Role[];
	policies: Policy[];
	spaces: Space[];
	directories: Directory[];
	assignments: Assignment[];
}
export type CreateAccountActorResponseResult = ApiResult<CreateAccountActorResponse>;

export interface CreateAssignmentParams {
	actor: ActorId;
	actor_id: ActorId;
	hub_id: HubId;
	role_id: RoleId;
}
export interface CreateAssignmentResponse {
	/**
	 * Describes the relationship between an <Vocab name="Actor" /> and <Vocab name="Role" /> within a given <Vocab name="Hub" />.
	 * An <Vocab name="Actor" /> must have at least 1 <Vocab name="Assignment" /> to be in a <Vocab name="Hub" /> and see it in the nav.
	 * When initially joining a <Vocab name="Hub" />, <Vocab name="Actor" />s are given an <Vocab name="Assignment" /> to the default <Vocab name="Role" />.
	 */
	assignment: Assignment;
}
export type CreateAssignmentResponseResult = ApiResult<CreateAssignmentResponse>;

export interface CreateEntityParams {
	actor: ActorId;
	space_id: SpaceId;
	path?: string | null;
	data: EntityData;
	ties?: (
		| {
				source_id: EntityId;
				type?: string;
		  }
		| {
				dest_id: EntityId;
				type?: string;
		  }
	)[];
}
export interface CreateEntityResponse {
	entities: Entity[];
	ties: Tie[];
}
export type CreateEntityResponseResult = ApiResult<CreateEntityResponse>;

export interface CreateHubParams {
	actor: ActorId;
	template: HubTemplate;
}
export interface CreateHubResponse {
	/**
	 * <Vocab name="Hub" />s represent the membrane around the places <Vocab name="Actor" />s can interact with each other or with system level data.
	 * They have self contained governance and ownership of <Vocab name="Space" />s within them.
	 * By default they are hidden and undiscoverable and are only visible to a user once an <Vocab name="Actor" /> has been invited in.
	 */
	hub: Hub;
	roles: Role[];
	spaces: Space[];
	directories: Directory[];
	assignments: Assignment[];
	policies: Policy[];
	actors: PublicActor[];
}
export type CreateHubResponseResult = ApiResult<CreateHubResponse>;

export type CreateInviteParams = null;

export interface CreateInviteResponse {
	invite: Invite;
}

export type CreateInviteResponseResult = ApiResult<CreateInviteResponse>;

export interface CreatePolicyParams {
	actor: ActorId;
	role_id: RoleId;
	name: PolicyName;
}
export interface CreatePolicyResponse {
	/**
	 * Each <Vocab name="Policy" /> associates a <Vocab name="Role" /> with a name
	 * to describe the Actions that <Vocab name="Actor" />s with the <Vocab name="Role" /> are able to perform.
	 * Policies are often 1:1 with Actions, but they don't have to be.
	 * `data` is a stub to support more complex governance schemes in the future.
	 */
	policy: Policy;
}
export type CreatePolicyResponseResult = ApiResult<CreatePolicyResponse>;

export interface CreateRoleParams {
	actor: ActorId;
	hub_id: HubId;
	name: string;
}
export interface CreateRoleResponse {
	/**
	 * <Vocab name="Role" />s are user-defined governance objects that exist within the context of a single <Vocab name="Hub" />.
	 * They have <Vocab name="Policy" />s associated with them that allow for actions to be taken within the system.
	 * When an <Vocab name="Actor" /> has a <Vocab name="Role" /> via an <Vocab name="Assignment" />,
	 * that actor may take any action allowed by the role's <Vocab name="Policy" />s.
	 */
	role: Role;
}
export type CreateRoleResponseResult = ApiResult<CreateRoleResponse>;

export interface CreateSpaceParams {
	actor: ActorId;
	hub_id: HubId;
	name: string;
	icon: string;
	view: string;
}
export interface CreateSpaceResponse {
	/**
	 * <Vocab name="Space" />s are subdivisions within a <Vocab name="Hub" /> that hold a View and reference to an <Vocab name="Entity" /> directory.
	 * The View is used to interpret, visualize, and manipulate the <Vocab name="Entity" />s connected to the directory.
	 * Each is a Svelte component that conforms to the View interface.
	 */
	space: Space;
	/**
	 * An <Vocab name="Entity" /> is the core data type that represents an ActivityStreams object in the system.
	 * Each has an "owning" space and actor that controls its governance.
	 * <Vocab name="Entity" /> objects exist within a graph architecture, with <Vocab name="Tie" /> objects serving as the edges between nodes.
	 * Conventionally, all entities within a given <Vocab name="Space" /> can be found by traversing
	 * the graph starting at the directory <Vocab name="Entity" /> associated with the owning <Vocab name="Space" />.
	 * A directory is an ActivityStreams Collection referenced by each <Vocab name="Space" />.
	 */
	directory: Directory;
}
export type CreateSpaceResponseResult = ApiResult<CreateSpaceResponse>;

export interface DeleteActorParams {
	actor: ActorId;
	actor_id: ActorId;
}
export type DeleteActorResponse = null;
export type DeleteActorResponseResult = ApiResult<DeleteActorResponse>;

export interface DeleteAssignmentParams {
	actor: ActorId;
	assignment_id: AssignmentId;
}
export type DeleteAssignmentResponse = null;
export type DeleteAssignmentResponseResult = ApiResult<DeleteAssignmentResponse>;

export interface DeleteEntitiesParams {
	actor: ActorId;
	entityIds: EntityId[];
}
export interface DeleteEntitiesResponse {
	entities: Entity[];
	deleted: Flavored<number, 'EntityId'>[];
}
export type DeleteEntitiesResponseResult = ApiResult<DeleteEntitiesResponse>;

export interface DeleteHubParams {
	actor: ActorId;
	hub_id: HubId;
}
export type DeleteHubResponse = null;
export type DeleteHubResponseResult = ApiResult<DeleteHubResponse>;

export interface DeletePolicyParams {
	actor: ActorId;
	policy_id: PolicyId;
}
export type DeletePolicyResponse = null;
export type DeletePolicyResponseResult = ApiResult<DeletePolicyResponse>;

export interface DeleteRoleParams {
	actor: ActorId;
	role_id: RoleId;
}
export type DeleteRoleResponse = null;
export type DeleteRoleResponseResult = ApiResult<DeleteRoleResponse>;

export interface DeleteSpaceParams {
	actor: ActorId;
	space_id: SpaceId;
}
export type DeleteSpaceResponse = null;
export type DeleteSpaceResponseResult = ApiResult<DeleteSpaceResponse>;

export interface EphemeraParams {
	actor: ActorId;
	space_id: SpaceId;
	data: {
		type: string;
		[k: string]: unknown;
	};
}
export interface EphemeraResponse {
	actor: ActorId;
	space_id: SpaceId;
	data: {
		type: string;
		[k: string]: unknown;
	};
}
export type EphemeraResponseResult = ApiResult<EphemeraResponse>;

export interface EraseEntitiesParams {
	actor: ActorId;
	entityIds: EntityId[];
}
export interface EraseEntitiesResponse {
	entities: Entity[];
}
export type EraseEntitiesResponseResult = ApiResult<EraseEntitiesResponse>;

export interface InviteToHubParams {
	actor: ActorId;
	hub_id: HubId;
	name: string;
}
export interface InviteToHubResponse {
	/**
	 * A subset of an <Vocab name="Actor" /> available to all clients in a <Vocab name="Hub" />.
	 */
	actor: PublicActor;
	/**
	 * Describes the relationship between an <Vocab name="Actor" /> and <Vocab name="Role" /> within a given <Vocab name="Hub" />.
	 * An <Vocab name="Actor" /> must have at least 1 <Vocab name="Assignment" /> to be in a <Vocab name="Hub" /> and see it in the nav.
	 * When initially joining a <Vocab name="Hub" />, <Vocab name="Actor" />s are given an <Vocab name="Assignment" /> to the default <Vocab name="Role" />.
	 */
	assignment: Assignment;
}
export type InviteToHubResponseResult = ApiResult<InviteToHubResponse>;

export interface KickFromHubParams {
	actor: ActorId;
	actor_id: ActorId;
	hub_id: HubId;
}
export type KickFromHubResponse = null;
export type KickFromHubResponseResult = ApiResult<KickFromHubResponse>;

export interface LeaveHubParams {
	actor: ActorId;
	actor_id: ActorId;
	hub_id: HubId;
}
export type LeaveHubResponse = null;
export type LeaveHubResponseResult = ApiResult<LeaveHubResponse>;

export type OpenDialogParams = Dialog_Params;

export type PingParams = null;
export type PingResponse = null;
export type PingResponseResult = ApiResult<PingResponse>;

export interface ReadEntitiesParams {
	actor: ActorId;
	source_id: EntityId;
	pageSize?: number;
	pageKey?: number;
	related?: 'source' | 'dest' | 'both';
	orderBy?: 'newest' | 'oldest';
}
export interface ReadEntitiesResponse {
	entities: Entity[];
	ties: Tie[];
	more: boolean;
}
export type ReadEntitiesResponseResult = ApiResult<ReadEntitiesResponse>;

export interface ReadEntitiesByIdParams {
	actor: ActorId;
	entityIds: EntityId[];
}
export interface ReadEntitiesByIdResponse {
	entities: Entity[];
}
export type ReadEntitiesByIdResponseResult = ApiResult<ReadEntitiesByIdResponse>;

export interface ReadHubParams {
	actor: ActorId;
	hub_id: HubId;
}
export interface ReadHubResponse {
	/**
	 * <Vocab name="Hub" />s represent the membrane around the places <Vocab name="Actor" />s can interact with each other or with system level data.
	 * They have self contained governance and ownership of <Vocab name="Space" />s within them.
	 * By default they are hidden and undiscoverable and are only visible to a user once an <Vocab name="Actor" /> has been invited in.
	 */
	hub: Hub;
	spaces: Space[];
	directories: Directory[];
	roles: Role[];
	assignments: Assignment[];
	actors: PublicActor[];
}
export type ReadHubResponseResult = ApiResult<ReadHubResponse>;

export interface ReadPoliciesParams {
	actor: ActorId;
	role_id: RoleId;
}
export interface ReadPoliciesResponse {
	policies: Policy[];
}
export type ReadPoliciesResponseResult = ApiResult<ReadPoliciesResponse>;

export interface ReadRolesParams {
	actor: ActorId;
	hub_id: HubId;
}
export interface ReadRolesResponse {
	roles: Role[];
}
export type ReadRolesResponseResult = ApiResult<ReadRolesResponse>;

export interface ReadSpacesParams {
	actor: ActorId;
	hub_id: HubId;
}
export interface ReadSpacesResponse {
	spaces: Space[];
	directories: Directory[];
}
export type ReadSpacesResponseResult = ApiResult<ReadSpacesResponse>;

export type SetMobileParams = boolean;

export interface SetSessionParams {
	/**
	 * The session data loaded on each page for authenticated and unauthenticated users.
	 */
	session: ClientSession;
}

export interface SignInParams {
	username: string;
	password: string;
	token: string;
}
export interface SignInResponse {
	/**
	 * The session data loaded on each page for authenticated users.
	 */
	session: ClientAccountSession;
}
export type SignInResponseResult = ApiResult<SignInResponse>;

export type SignOutParams = null;
export type SignOutResponse = null;
export type SignOutResponseResult = ApiResult<SignOutResponse>;

export interface SignUpParams {
	username: string;
	password: string;
	token: string;
	code?: string;
}
export interface SignUpResponse {
	/**
	 * The session data loaded on each page for authenticated users.
	 */
	session: ClientAccountSession;
}
export type SignUpResponseResult = ApiResult<SignUpResponse>;

export type ToggleMainNavParams = void;

export type ToggleSecondaryNavParams = void;

export interface UpdateAccountPasswordParams {
	oldPassword: string;
	newPassword: string;
}
/**
 * A client-facing subset of an <Vocab name="Account" />. Excludes <code>password</code> for security.
 */
export type UpdateAccountPasswordResponse = ClientAccount;
export type UpdateAccountPasswordResponseResult = ApiResult<UpdateAccountPasswordResponse>;

export interface UpdateAccountSettingsParams {
	/**
	 * A nested set of attributes on <Vocab name="Account" /> and <Vocab name="ClientAccount" />. Holds all account level settings.
	 */
	settings: AccountSettings;
}
/**
 * A client-facing subset of an <Vocab name="Account" />. Excludes <code>password</code> for security.
 */
export type UpdateAccountSettingsResponse = ClientAccount;
export type UpdateAccountSettingsResponseResult = ApiResult<UpdateAccountSettingsResponse>;

export interface UpdateEntitiesParams {
	actor: ActorId;
	entities: {
		entity_id: EntityId;
		data?: EntityData;
		path?: string | null;
	}[];
}
export interface UpdateEntitiesResponse {
	entities: Entity[];
}
export type UpdateEntitiesResponseResult = ApiResult<UpdateEntitiesResponse>;

export interface UpdateHubParams {
	actor: ActorId;
	hub_id: HubId;
	/**
	 * A nested set of attributes on <Vocab name="Hub" />. Holds all hub level settings.
	 */
	settings?: HubSettings;
}
export interface UpdateHubResponse {
	/**
	 * <Vocab name="Hub" />s represent the membrane around the places <Vocab name="Actor" />s can interact with each other or with system level data.
	 * They have self contained governance and ownership of <Vocab name="Space" />s within them.
	 * By default they are hidden and undiscoverable and are only visible to a user once an <Vocab name="Actor" /> has been invited in.
	 */
	hub: Hub;
}
export type UpdateHubResponseResult = ApiResult<UpdateHubResponse>;

export interface UpdatePolicyParams {
	actor: ActorId;
	policy_id: PolicyId;
	data: {
		[k: string]: unknown;
	} | null;
}
export interface UpdatePolicyResponse {
	/**
	 * Each <Vocab name="Policy" /> associates a <Vocab name="Role" /> with a name
	 * to describe the Actions that <Vocab name="Actor" />s with the <Vocab name="Role" /> are able to perform.
	 * Policies are often 1:1 with Actions, but they don't have to be.
	 * `data` is a stub to support more complex governance schemes in the future.
	 */
	policy: Policy;
}
export type UpdatePolicyResponseResult = ApiResult<UpdatePolicyResponse>;

export interface UpdateRoleParams {
	actor: ActorId;
	role_id: RoleId;
	name: string;
}
export interface UpdateRoleResponse {
	/**
	 * <Vocab name="Role" />s are user-defined governance objects that exist within the context of a single <Vocab name="Hub" />.
	 * They have <Vocab name="Policy" />s associated with them that allow for actions to be taken within the system.
	 * When an <Vocab name="Actor" /> has a <Vocab name="Role" /> via an <Vocab name="Assignment" />,
	 * that actor may take any action allowed by the role's <Vocab name="Policy" />s.
	 */
	role: Role;
}
export type UpdateRoleResponseResult = ApiResult<UpdateRoleResponse>;

export interface UpdateSpaceParams {
	actor: ActorId;
	space_id: SpaceId;
	name?: string;
	icon?: string;
	view?: string;
}
export interface UpdateSpaceResponse {
	/**
	 * <Vocab name="Space" />s are subdivisions within a <Vocab name="Hub" /> that hold a View and reference to an <Vocab name="Entity" /> directory.
	 * The View is used to interpret, visualize, and manipulate the <Vocab name="Entity" />s connected to the directory.
	 * Each is a Svelte component that conforms to the View interface.
	 */
	space: Space;
}
export type UpdateSpaceResponseResult = ApiResult<UpdateSpaceResponse>;

export interface RunTaskParams {
	actor: ActorId;
	hub_id: HubId;
	task: string;
	args: string[];
}

export interface RunTaskResponse {
	message: string;
}

export type RunTaskResponseResult = ApiResult<RunTaskResponse>;

export interface ViewSpaceParams {
	space_id: SpaceId;
	view: string | null;
}

export interface Actions {
	ClearFreshness: (params: ClearFreshnessParams) => void;
	CloseDialog: (params: CloseDialogParams) => void;
	CreateAccountActor: (
		params: CreateAccountActorParams,
	) => Promise<CreateAccountActorResponseResult>;
	CreateAssignment: (params: CreateAssignmentParams) => Promise<CreateAssignmentResponseResult>;
	CreateEntity: (params: CreateEntityParams) => Promise<CreateEntityResponseResult>;
	CreateHub: (params: CreateHubParams) => Promise<CreateHubResponseResult>;
	CreateInvite: (params: CreateInviteParams) => Promise<CreateInviteResponseResult>;
	CreatePolicy: (params: CreatePolicyParams) => Promise<CreatePolicyResponseResult>;
	CreateRole: (params: CreateRoleParams) => Promise<CreateRoleResponseResult>;
	CreateSpace: (params: CreateSpaceParams) => Promise<CreateSpaceResponseResult>;
	DeleteActor: (params: DeleteActorParams) => Promise<DeleteActorResponseResult>;
	DeleteAssignment: (params: DeleteAssignmentParams) => Promise<DeleteAssignmentResponseResult>;
	DeleteEntities: (params: DeleteEntitiesParams) => Promise<DeleteEntitiesResponseResult>;
	DeleteHub: (params: DeleteHubParams) => Promise<DeleteHubResponseResult>;
	DeletePolicy: (params: DeletePolicyParams) => Promise<DeletePolicyResponseResult>;
	DeleteRole: (params: DeleteRoleParams) => Promise<DeleteRoleResponseResult>;
	DeleteSpace: (params: DeleteSpaceParams) => Promise<DeleteSpaceResponseResult>;
	Ephemera: (params: EphemeraParams) => Promise<EphemeraResponseResult>;
	EraseEntities: (params: EraseEntitiesParams) => Promise<EraseEntitiesResponseResult>;
	InviteToHub: (params: InviteToHubParams) => Promise<InviteToHubResponseResult>;
	KickFromHub: (params: KickFromHubParams) => Promise<KickFromHubResponseResult>;
	LeaveHub: (params: LeaveHubParams) => Promise<LeaveHubResponseResult>;
	OpenDialog: (params: OpenDialogParams) => void;
	Ping: () => Promise<ApiResult<null>>;
	ReadEntities: (params: ReadEntitiesParams) => Promise<ReadEntitiesResponseResult>;
	ReadEntitiesById: (params: ReadEntitiesByIdParams) => Promise<ReadEntitiesByIdResponseResult>;
	ReadHub: (params: ReadHubParams) => Promise<ReadHubResponseResult>;
	ReadPolicies: (params: ReadPoliciesParams) => Promise<ReadPoliciesResponseResult>;
	ReadRoles: (params: ReadRolesParams) => Promise<ReadRolesResponseResult>;
	ReadSpaces: (params: ReadSpacesParams) => Promise<ReadSpacesResponseResult>;
	RunTask: (params: RunTaskParams) => Promise<RunTaskResponseResult>;
	SetMobile: (params: SetMobileParams) => void;
	SetSession: (params: SetSessionParams) => void;
	SignIn: (params: SignInParams) => Promise<SignInResponseResult>;
	SignOut: () => Promise<SignOutResponseResult>;
	SignUp: (params: SignUpParams) => Promise<SignUpResponseResult>;
	ToggleMainNav: (params: ToggleMainNavParams) => void;
	ToggleSecondaryNav: (params: ToggleSecondaryNavParams) => void;
	UpdateAccountPassword: (
		params: UpdateAccountPasswordParams,
	) => Promise<UpdateAccountPasswordResponseResult>;
	UpdateAccountSettings: (
		params: UpdateAccountSettingsParams,
	) => Promise<UpdateAccountSettingsResponseResult>;
	UpdateEntities: (params: UpdateEntitiesParams) => Promise<UpdateEntitiesResponseResult>;
	UpdateHub: (params: UpdateHubParams) => Promise<UpdateHubResponseResult>;
	UpdatePolicy: (params: UpdatePolicyParams) => Promise<UpdatePolicyResponseResult>;
	UpdateRole: (params: UpdateRoleParams) => Promise<UpdateRoleResponseResult>;
	UpdateSpace: (params: UpdateSpaceParams) => Promise<UpdateSpaceResponseResult>;
	ViewSpace: (params: ViewSpaceParams) => void;
}

export interface Mutations {
	ClearFreshness: (ctx: MutationContext<ClearFreshnessParams, void>) => void;
	CloseDialog: (ctx: MutationContext<CloseDialogParams, void>) => void;
	CreateAccountActor: (
		ctx: MutationContext<CreateAccountActorParams, CreateAccountActorResponseResult>,
	) => Promise<CreateAccountActorResponseResult>;
	CreateAssignment: (
		ctx: MutationContext<CreateAssignmentParams, CreateAssignmentResponseResult>,
	) => Promise<CreateAssignmentResponseResult>;
	CreateEntity: (
		ctx: MutationContext<CreateEntityParams, CreateEntityResponseResult>,
	) => Promise<CreateEntityResponseResult>;
	CreateHub: (
		ctx: MutationContext<CreateHubParams, CreateHubResponseResult>,
	) => Promise<CreateHubResponseResult>;
	CreateInvite: (
		ctx: MutationContext<CreateInviteParams, CreateInviteResponseResult>,
	) => Promise<CreateInviteResponseResult>;
	CreatePolicy: (
		ctx: MutationContext<CreatePolicyParams, CreatePolicyResponseResult>,
	) => Promise<CreatePolicyResponseResult>;
	CreateRole: (
		ctx: MutationContext<CreateRoleParams, CreateRoleResponseResult>,
	) => Promise<CreateRoleResponseResult>;
	CreateSpace: (
		ctx: MutationContext<CreateSpaceParams, CreateSpaceResponseResult>,
	) => Promise<CreateSpaceResponseResult>;
	DeleteActor: (
		ctx: MutationContext<DeleteActorParams, DeleteActorResponseResult>,
	) => Promise<DeleteActorResponseResult>;
	DeleteAssignment: (
		ctx: MutationContext<DeleteAssignmentParams, DeleteAssignmentResponseResult>,
	) => Promise<DeleteAssignmentResponseResult>;
	DeleteEntities: (
		ctx: MutationContext<DeleteEntitiesParams, DeleteEntitiesResponseResult>,
	) => Promise<DeleteEntitiesResponseResult>;
	DeleteHub: (
		ctx: MutationContext<DeleteHubParams, DeleteHubResponseResult>,
	) => Promise<DeleteHubResponseResult>;
	DeletePolicy: (
		ctx: MutationContext<DeletePolicyParams, DeletePolicyResponseResult>,
	) => Promise<DeletePolicyResponseResult>;
	DeleteRole: (
		ctx: MutationContext<DeleteRoleParams, DeleteRoleResponseResult>,
	) => Promise<DeleteRoleResponseResult>;
	DeleteSpace: (
		ctx: MutationContext<DeleteSpaceParams, DeleteSpaceResponseResult>,
	) => Promise<DeleteSpaceResponseResult>;
	Ephemera: (
		ctx: MutationContext<EphemeraParams, EphemeraResponseResult>,
	) => Promise<EphemeraResponseResult>;
	EraseEntities: (
		ctx: MutationContext<EraseEntitiesParams, EraseEntitiesResponseResult>,
	) => Promise<EraseEntitiesResponseResult>;
	InviteToHub: (
		ctx: MutationContext<InviteToHubParams, InviteToHubResponseResult>,
	) => Promise<InviteToHubResponseResult>;
	KickFromHub: (
		ctx: MutationContext<KickFromHubParams, KickFromHubResponseResult>,
	) => Promise<KickFromHubResponseResult>;
	LeaveHub: (
		ctx: MutationContext<LeaveHubParams, LeaveHubResponseResult>,
	) => Promise<LeaveHubResponseResult>;
	OpenDialog: (ctx: MutationContext<OpenDialogParams, void>) => void;
	Ping: (ctx: MutationContext<PingParams, PingResponseResult>) => Promise<ApiResult<null>>;
	ReadEntities: (
		ctx: MutationContext<ReadEntitiesParams, ReadEntitiesResponseResult>,
	) => Promise<ReadEntitiesResponseResult>;
	ReadEntitiesById: (
		ctx: MutationContext<ReadEntitiesByIdParams, ReadEntitiesByIdResponseResult>,
	) => Promise<ReadEntitiesByIdResponseResult>;
	ReadHub: (
		ctx: MutationContext<ReadHubParams, ReadHubResponseResult>,
	) => Promise<ReadHubResponseResult>;
	ReadPolicies: (
		ctx: MutationContext<ReadPoliciesParams, ReadPoliciesResponseResult>,
	) => Promise<ReadPoliciesResponseResult>;
	ReadRoles: (
		ctx: MutationContext<ReadRolesParams, ReadRolesResponseResult>,
	) => Promise<ReadRolesResponseResult>;
	ReadSpaces: (
		ctx: MutationContext<ReadSpacesParams, ReadSpacesResponseResult>,
	) => Promise<ReadSpacesResponseResult>;
	RunTask: (
		ctx: MutationContext<RunTaskParams, RunTaskResponseResult>,
	) => Promise<RunTaskResponseResult>;
	SetMobile: (ctx: MutationContext<SetMobileParams, void>) => void;
	SetSession: (ctx: MutationContext<SetSessionParams, void>) => void;
	SignIn: (
		ctx: MutationContext<SignInParams, SignInResponseResult>,
	) => Promise<SignInResponseResult>;
	SignOut: (
		ctx: MutationContext<SignOutParams, SignOutResponseResult>,
	) => Promise<SignOutResponseResult>;
	SignUp: (
		ctx: MutationContext<SignUpParams, SignUpResponseResult>,
	) => Promise<SignUpResponseResult>;
	ToggleMainNav: (ctx: MutationContext<ToggleMainNavParams, void>) => void;
	ToggleSecondaryNav: (ctx: MutationContext<ToggleSecondaryNavParams, void>) => void;
	UpdateAccountPassword: (
		ctx: MutationContext<UpdateAccountPasswordParams, UpdateAccountPasswordResponseResult>,
	) => Promise<UpdateAccountPasswordResponseResult>;
	UpdateAccountSettings: (
		ctx: MutationContext<UpdateAccountSettingsParams, UpdateAccountSettingsResponseResult>,
	) => Promise<UpdateAccountSettingsResponseResult>;
	UpdateEntities: (
		ctx: MutationContext<UpdateEntitiesParams, UpdateEntitiesResponseResult>,
	) => Promise<UpdateEntitiesResponseResult>;
	UpdateHub: (
		ctx: MutationContext<UpdateHubParams, UpdateHubResponseResult>,
	) => Promise<UpdateHubResponseResult>;
	UpdatePolicy: (
		ctx: MutationContext<UpdatePolicyParams, UpdatePolicyResponseResult>,
	) => Promise<UpdatePolicyResponseResult>;
	UpdateRole: (
		ctx: MutationContext<UpdateRoleParams, UpdateRoleResponseResult>,
	) => Promise<UpdateRoleResponseResult>;
	UpdateSpace: (
		ctx: MutationContext<UpdateSpaceParams, UpdateSpaceResponseResult>,
	) => Promise<UpdateSpaceResponseResult>;
	ViewSpace: (ctx: MutationContext<ViewSpaceParams, void>) => void;
}
