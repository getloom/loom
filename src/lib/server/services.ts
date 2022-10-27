import type {Service} from '$lib/server/service';
import {PingService, EphemeraService} from '$lib/server/uiServices';
import {SignInService, SignOutService} from '$lib/session/sessionServices';
import {CreateAccountPersonaService, ReadPersonaService} from '$lib/vocab/persona/personaServices';
import {
	ReadCommunityService,
	ReadCommunitiesService,
	CreateCommunityService,
	UpdateCommunitySettingsService,
	DeleteCommunityService,
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
	ReadSpaceService,
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
	SignUpService,
	UpdateAccountSettingsService,
	UpdateAccountPasswordService,
} from '$lib/vocab/account/accountServices';

export const services: Map<string, Service> = new Map(
	[
		// uiServices
		PingService,
		EphemeraService,
		// sessionServices
		SignInService,
		SignOutService,
		// accountServices
		SignUpService,
		UpdateAccountSettingsService,
		UpdateAccountPasswordService,
		// personaServices
		CreateAccountPersonaService,
		ReadPersonaService,
		// communityServices
		ReadCommunityService,
		ReadCommunitiesService,
		CreateCommunityService,
		UpdateCommunitySettingsService,
		DeleteCommunityService,
		LeaveCommunityService,
		// assignmentServices
		CreateAssignmentService,
		DeleteAssignmentService,
		// spaceServices
		ReadSpaceService,
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
	].map((s) => [s.event.name, s]),
);
