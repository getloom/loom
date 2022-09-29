import type {Service} from '$lib/server/service';
import {PingService, EphemeraService} from '$lib/server/uiServices';
import {LoginService, LogoutService} from '$lib/session/sessionServices';
import {CreateAccountPersonaService, ReadPersonaService} from '$lib/vocab/persona/personaServices';
import {
	ReadCommunityService,
	ReadCommunitiesService,
	CreateCommunityService,
	UpdateCommunitySettingsService,
	DeleteCommunityService,
} from '$lib/vocab/community/communityServices';
import {
	CreateMembershipService,
	DeleteMembershipService,
} from '$lib/vocab/membership/membershipServices';
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
	DeleteRolesService,
	ReadRolesService,
	UpdateRoleService,
} from '$lib/vocab/role/roleServices';

export const services: Map<string, Service> = new Map(
	[
		// uiServices
		PingService,
		EphemeraService,
		// sessionServices
		LoginService,
		LogoutService,
		// personaServices
		CreateAccountPersonaService,
		ReadPersonaService,
		// communityServices
		ReadCommunityService,
		ReadCommunitiesService,
		CreateCommunityService,
		UpdateCommunitySettingsService,
		DeleteCommunityService,
		// membershipServices
		CreateMembershipService,
		DeleteMembershipService,
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
		DeleteRolesService,
	].map((s) => [s.event.name, s]),
);
