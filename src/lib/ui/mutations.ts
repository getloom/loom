import type {Mutation} from '$lib/ui/mutation';
import {
	SignUp,
	SignIn,
	SignOut,
	UpdateAccountSettings,
	UpdateAccountPassword,
} from '$lib/vocab/account/accountMutations';
import {CreateAccountActor, DeleteActor} from '$lib/vocab/actor/actorMutations';
import {
	ReadHub,
	CreateHub,
	UpdateHub,
	DeleteHub,
	InviteToHub,
	LeaveHub,
	KickFromHub,
} from '$lib/vocab/hub/hubMutations';
import {CreateSpace, DeleteSpace, UpdateSpace} from '$lib/vocab/space/spaceMutations';
import {CreateAssignment, DeleteAssignment} from '$lib/vocab/assignment/assignmentMutations';
import {
	CreateEntity,
	UpdateEntities,
	EraseEntities,
	DeleteEntities,
	ReadEntities,
	ReadEntitiesById,
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
	// actorMutations
	CreateAccountActor,
	DeleteActor,
	// hubMutations
	ReadHub,
	CreateHub,
	UpdateHub,
	DeleteHub,
	InviteToHub,
	LeaveHub,
	KickFromHub,
	// spaceMutations
	CreateSpace,
	DeleteSpace,
	UpdateSpace,
	// assignmentMutations
	CreateAssignment,
	DeleteAssignment,
	// entityMutations
	CreateEntity,
	UpdateEntities,
	EraseEntities,
	DeleteEntities,
	ReadEntities,
	ReadEntitiesById,
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
