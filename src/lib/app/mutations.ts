import type {Mutation} from '$lib/ui/mutation';
import {
	SignUp,
	SignIn,
	SignOut,
	UpdateAccountSettings,
	UpdateAccountPassword,
} from '$lib/vocab/account/accountMutations';
import {CreateAccountPersona, DeletePersona} from '$lib/vocab/persona/personaMutations';
import {
	ReadHub,
	CreateHub,
	UpdateHubSettings,
	DeleteHub,
	InviteToHub,
	LeaveHub,
} from '$lib/vocab/hub/hubMutations';
import {CreateSpace, DeleteSpace, UpdateSpace} from '$lib/vocab/space/spaceMutations';
import {CreateAssignment, DeleteAssignment} from '$lib/vocab/assignment/assignmentMutations';
import {
	CreateEntity,
	UpdateEntity,
	EraseEntities,
	DeleteEntities,
	ReadEntities,
	ReadEntitiesPaginated,
	QueryEntities,
} from '$lib/vocab/entity/entityMutations';
import {CreateRole, UpdateRole, ReadRoles, DeleteRole} from '$lib/vocab/role/roleMutations';
import {CreatePolicy, DeletePolicy} from '$lib/vocab/policy/policyMutations';
import {
	Ping,
	Ephemera,
	SetSession,
	SetMobile,
	OpenDialog,
	CloseDialog,
	ViewSpace,
	ClearFreshness,
	ToggleMainNav,
	ToggleSecondaryNav,
} from '$lib/ui/uiMutations';

export const mutations: Record<string, Mutation> = {
	// accountMutations
	SignUp,
	SignIn,
	SignOut,
	UpdateAccountSettings,
	UpdateAccountPassword,
	// personaMutations
	CreateAccountPersona,
	DeletePersona,
	// hubMutations
	ReadHub,
	CreateHub,
	UpdateHubSettings,
	DeleteHub,
	InviteToHub,
	LeaveHub,
	// spaceMutations
	CreateSpace,
	DeleteSpace,
	UpdateSpace,
	// assignmentMutations
	CreateAssignment,
	DeleteAssignment,
	// entityMutations
	CreateEntity,
	UpdateEntity,
	EraseEntities,
	DeleteEntities,
	ReadEntities,
	ReadEntitiesPaginated,
	QueryEntities,
	// roleMutations
	CreateRole,
	UpdateRole,
	ReadRoles,
	DeleteRole,
	// policyMutations
	CreatePolicy,
	DeletePolicy,
	// uiMutations
	Ping,
	Ephemera,
	SetSession,
	SetMobile,
	OpenDialog,
	CloseDialog,
	ViewSpace,
	ClearFreshness,
	ToggleMainNav,
	ToggleSecondaryNav,
};
