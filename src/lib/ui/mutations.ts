import type {Mutation} from '$lib/util/mutation.js';
import {
	SignUp,
	SignIn,
	SignOut,
	UpdateAccountSettings,
	UpdateAccountPassword,
} from '$lib/vocab/account/accountMutations.js';
import {CreateAccountActor, DeleteActor} from '$lib/vocab/actor/actorMutations.js';
import {
	ReadHub,
	CreateHub,
	UpdateHub,
	DeleteHub,
	InviteToHub,
	LeaveHub,
	KickFromHub,
} from '$lib/vocab/hub/hubMutations.js';
import {CreateSpace, DeleteSpace, UpdateSpace} from '$lib/vocab/space/spaceMutations.js';
import {CreateAssignment, DeleteAssignment} from '$lib/vocab/assignment/assignmentMutations.js';
import {
	CreateEntity,
	UpdateEntities,
	EraseEntities,
	DeleteEntities,
	ReadEntities,
	ReadEntitiesById,
} from '$lib/vocab/entity/entityMutations.js';
import {CreateRole, UpdateRole, ReadRoles, DeleteRole} from '$lib/vocab/role/roleMutations.js';
import {CreatePolicy, DeletePolicy} from '$lib/vocab/policy/policyMutations.js';
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
} from '$lib/ui/uiMutations.js';

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
