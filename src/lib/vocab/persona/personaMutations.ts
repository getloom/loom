import type {Mutations} from '$lib/app/eventTypes';
import {stashPersonas} from '$lib/vocab/persona/personaMutationHelpers';
import {stashCommunity} from '$lib/vocab/community/communityMutationHelpers';
import {stashRoles} from '$lib/vocab/role/roleMutationHelpers';
import {Mutated} from '$lib/util/Mutated';
import {stashSpaces} from '$lib/vocab/space/spaceMutationHelpers';
import {stashMemberships} from '$lib/vocab/membership/membershipMutationHelpers';

export const CreateAccountPersona: Mutations['CreateAccountPersona'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {
		persona: $persona,
		community: $community,
		role: $role,
		spaces: $spaces,
		directories: $directories,
		membership: $membership,
	} = result.value;
	const mutated = new Mutated('CreateAccountPersona');
	stashPersonas(ui, [$persona], mutated);
	stashCommunity(ui, $community, mutated);
	stashSpaces(ui, $spaces, $directories, mutated);
	stashMemberships(ui, [$membership], mutated);
	stashRoles(ui, [$role], mutated);
	mutated.end('CreateAccountPersona');
	return result;
};
