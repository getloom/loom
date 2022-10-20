import type {Mutations} from '$lib/app/eventTypes';
import {stashPersonas} from '$lib/vocab/persona/personaMutationHelpers';
import {stashCommunities} from '$lib/vocab/community/communityMutationHelpers';
import {stashRoles} from '$lib/vocab/role/roleMutationHelpers';
import {Mutated} from '$lib/util/Mutated';
import {stashSpaces} from '$lib/vocab/space/spaceMutationHelpers';
import {stashAssignments} from '$lib/vocab/assignment/assignmentMutationHelpers';

export const CreateAccountPersona: Mutations['CreateAccountPersona'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {
		personas: $personas,
		communities: $communities,
		roles: $roles,
		spaces: $spaces,
		directories: $directories,
		assignments: $assignments,
	} = result.value;
	const mutated = new Mutated('CreateAccountPersona');
	stashPersonas(ui, $personas, mutated);
	stashCommunities(ui, $communities, mutated);
	stashSpaces(ui, $spaces, $directories, mutated);
	stashAssignments(ui, $assignments, mutated);
	stashRoles(ui, $roles, mutated);
	mutated.end('CreateAccountPersona');
	return result;
};
