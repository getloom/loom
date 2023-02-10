import type {Mutations} from '$lib/app/eventTypes';
import {stashPersonas, evictPersona} from '$lib/vocab/persona/personaMutationHelpers';
import {evictCommunity, stashCommunities} from '$lib/vocab/community/communityMutationHelpers';
import {stashRoles} from '$lib/vocab/role/roleMutationHelpers';
import {Mutated} from '$lib/util/Mutated';
import {stashSpaces} from '$lib/vocab/space/spaceMutationHelpers';
import {stashAssignments} from '$lib/vocab/assignment/assignmentMutationHelpers';
import {stashPolicies} from '$lib/vocab/policy/policyMutationHelpers';

export const CreateAccountPersona: Mutations['CreateAccountPersona'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {personas, communities, roles, policies, spaces, directories, assignments} = result.value;
	const mutated = new Mutated('CreateAccountPersona');
	stashPersonas(ui, personas, mutated);
	stashCommunities(ui, communities, mutated);
	stashSpaces(ui, spaces, directories, mutated);
	stashAssignments(ui, assignments, mutated);
	stashRoles(ui, roles, mutated);
	stashPolicies(ui, policies, mutated);
	mutated.end('CreateAccountPersona');
	return result;
};

export const DeletePersona: Mutations['DeletePersona'] = async ({params, invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {persona_id} = params;
	const persona = ui.personaById.get(persona_id);
	if (persona) {
		const mutated = new Mutated('DeletePersona');
		const $persona = persona.get();
		const community_id = 'community_id' in $persona ? $persona.community_id : null;
		// TODO `evictPersona` should possibly do this `evictCommunity` itself
		if (community_id) await evictCommunity(ui, community_id, mutated);
		await evictPersona(ui, persona, mutated);
		mutated.end('DeletePersona');
	}
	return result;
};
