import type {Service} from '$lib/server/service';
import {PingService, EphemeraService} from '$lib/server/uiServices';
import {
	CreateAccountPersonaService,
	DeletePersonaService,
} from '$lib/vocab/persona/personaServices';
import {
	ReadCommunityService,
	ReadCommunitiesService,
	CreateCommunityService,
	UpdateCommunitySettingsService,
	DeleteCommunityService,
	InviteToCommunityService,
	LeaveCommunityService,
} from '$lib/vocab/community/communityServices';
import {
	CreateAssignmentService,
	DeleteAssignmentService,
} from '$lib/vocab/assignment/assignmentServices';
import {
	ReadEntitiesService,
	ReadEntitiesPaginatedService,
	CreateEntityService,
	UpdateEntityService,
	EraseEntitiesService,
	DeleteEntitiesService,
} from '$lib/vocab/entity/entityServices';
import {
	ReadSpacesService,
	CreateSpaceService,
	UpdateSpaceService,
	DeleteSpaceService,
} from '$lib/vocab/space/spaceServices';
import {CreateTieService, ReadTiesService, DeleteTieService} from '$lib/vocab/tie/tieServices';
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
		// personaServices
		CreateAccountPersonaService,
		DeletePersonaService,
		// communityServices
		ReadCommunityService,
		ReadCommunitiesService,
		CreateCommunityService,
		UpdateCommunitySettingsService,
		DeleteCommunityService,
		InviteToCommunityService,
		LeaveCommunityService,
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
		UpdateEntityService,
		EraseEntitiesService,
		DeleteEntitiesService,
		// tieServices
		CreateTieService,
		ReadTiesService,
		DeleteTieService,
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
	].map((s) => [s.event.name, s]),
);
