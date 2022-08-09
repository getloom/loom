import type {Service} from '$lib/server/service';
import {PingService} from '$lib/server/pingService';
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

export const services: Map<string, Service<any, any>> = new Map(
	[
		PingService,
		LoginService,
		LogoutService,
		CreateAccountPersonaService,
		ReadPersonaService,
		CreateCommunityService,
		CreateMembershipService,
		DeleteMembershipService,
		CreateSpaceService,
		CreateEntityService,
		UpdateEntityService,
		EraseEntitiesService,
		DeleteEntitiesService,
		ReadCommunityService,
		ReadCommunitiesService,
		UpdateCommunitySettingsService,
		DeleteCommunityService,
		ReadSpaceService,
		ReadSpacesService,
		ReadEntitiesService,
		ReadEntitiesPaginatedService,
		UpdateSpaceService,
		DeleteSpaceService,
		CreateTieService,
		ReadTiesService,
		DeleteTieService,
	].map((s) => [s.event.name, s]),
);
