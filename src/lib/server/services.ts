import type {Service} from '$lib/server/service.js';
import {PingService, EphemeraService} from '$lib/server/uiServices.js';
import {CreateAccountActorService, DeleteActorService} from '$lib/vocab/actor/actorServices.js';
import {
	ReadHubService,
	CreateHubService,
	UpdateHubService,
	DeleteHubService,
	InviteToHubService,
	LeaveHubService,
	KickFromHubService,
} from '$lib/vocab/hub/hubServices.js';
import {
	CreateAssignmentService,
	DeleteAssignmentService,
} from '$lib/vocab/assignment/assignmentServices.js';
import {
	ReadEntitiesService,
	ReadEntitiesByIdService,
	CreateEntityService,
	UpdateEntitiesService,
	EraseEntitiesService,
	DeleteEntitiesService,
} from '$lib/vocab/entity/entityServices.js';
import {
	ReadSpacesService,
	CreateSpaceService,
	UpdateSpaceService,
	DeleteSpaceService,
} from '$lib/vocab/space/spaceServices.js';
import {
	CreateRoleService,
	DeleteRoleService,
	ReadRolesService,
	UpdateRoleService,
} from '$lib/vocab/role/roleServices.js';
import {
	CreatePolicyService,
	DeletePolicyService,
	ReadPoliciesService,
	UpdatePolicyService,
} from '$lib/vocab/policy/policyServices.js';
import {
	SignUpService,
	SignInService,
	SignOutService,
	UpdateAccountSettingsService,
	UpdateAccountPasswordService,
} from '$lib/vocab/account/accountServices.js';
import {RunTaskService} from '$lib/vocab/task/taskServices.js';
import {CreateInviteService} from '$lib/vocab/invite/inviteServices.js';

export const services: Map<string, Service> = new Map(
	[
		// uiServices
		PingService,
		EphemeraService,
		// accountServices
		SignUpService,
		SignInService,
		SignOutService,
		UpdateAccountSettingsService,
		UpdateAccountPasswordService,
		// actorServices
		CreateAccountActorService,
		DeleteActorService,
		// hubServices
		ReadHubService,
		CreateHubService,
		UpdateHubService,
		DeleteHubService,
		InviteToHubService,
		LeaveHubService,
		KickFromHubService,
		// assignmentServices
		CreateAssignmentService,
		DeleteAssignmentService,
		// spaceServices
		ReadSpacesService,
		CreateSpaceService,
		UpdateSpaceService,
		DeleteSpaceService,
		// entityServices
		ReadEntitiesService,
		ReadEntitiesByIdService,
		CreateEntityService,
		UpdateEntitiesService,
		EraseEntitiesService,
		DeleteEntitiesService,
		// roleServices
		CreateRoleService,
		ReadRolesService,
		UpdateRoleService,
		DeleteRoleService,
		// policyServices
		CreatePolicyService,
		DeletePolicyService,
		ReadPoliciesService,
		UpdatePolicyService,
		// taskServices
		RunTaskService,
		// inviteServices
		CreateInviteService,
	].map((s) => [s.action.name, s]),
);
