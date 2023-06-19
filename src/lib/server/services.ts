import type {Service} from '$lib/server/service';
import {PingService, EphemeraService} from '$lib/server/uiServices';
import {CreateAccountActorService, DeleteActorService} from '$lib/vocab/actor/actorServices';
import {
	ReadHubService,
	CreateHubService,
	UpdateHubService,
	DeleteHubService,
	InviteToHubService,
	LeaveHubService,
	KickFromHubService,
} from '$lib/vocab/hub/hubServices';
import {
	CreateAssignmentService,
	DeleteAssignmentService,
} from '$lib/vocab/assignment/assignmentServices';
import {
	ReadEntitiesService,
	ReadEntitiesPaginatedService,
	CreateEntityService,
	UpdateEntitiesService,
	EraseEntitiesService,
	DeleteEntitiesService,
	ReadEntitiesByIdService,
} from '$lib/vocab/entity/entityServices';
import {
	ReadSpacesService,
	CreateSpaceService,
	UpdateSpaceService,
	DeleteSpaceService,
} from '$lib/vocab/space/spaceServices';
import {
	CreateRoleService,
	DeleteRoleService,
	ReadRolesService,
	UpdateRoleService,
} from '$lib/vocab/role/roleServices';
import {
	CreatePolicyService,
	DeletePolicyService,
	ReadPoliciesService,
	UpdatePolicyService,
} from '$lib/vocab/policy/policyServices';
import {
	SignUpService,
	SignInService,
	SignOutService,
	UpdateAccountSettingsService,
	UpdateAccountPasswordService,
} from '$lib/vocab/account/accountServices';

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
		ReadEntitiesPaginatedService,
		CreateEntityService,
		UpdateEntitiesService,
		EraseEntitiesService,
		DeleteEntitiesService,
		ReadEntitiesByIdService,
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
	].map((s) => [s.action.name, s]),
);
