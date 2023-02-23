import type {Mutations} from '$lib/app/eventTypes';
import {stashPersonas, evictPersona} from '$lib/vocab/persona/personaMutationHelpers';
import {evictCommunity, stashCommunities} from '$lib/vocab/community/communityMutationHelpers';
import {stashRoles} from '$lib/vocab/role/roleMutationHelpers';
import {stashSpaces} from '$lib/vocab/space/spaceMutationHelpers';
import {stashAssignments} from '$lib/vocab/assignment/assignmentMutationHelpers';
import {stashPolicies} from '$lib/vocab/policy/policyMutationHelpers';

export const CreateAccountPersona: Mutations['CreateAccountPersona'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {personas, communities, roles, policies, spaces, directories, assignments} = result.value;
	ui.mutate(() => {
		stashPersonas(ui, personas);
		stashCommunities(ui, communities);
		stashSpaces(ui, spaces, directories);
		stashAssignments(ui, assignments);
		stashRoles(ui, roles);
		stashPolicies(ui, policies);
	});
	return result;
};

export const DeletePersona: Mutations['DeletePersona'] = async ({params, invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {persona_id} = params;
	const persona = ui.personaById.get(persona_id);
	if (persona) {
		ui.mutate(() => {
			const $persona = persona.get();
			const community_id = 'community_id' in $persona ? $persona.community_id : null;
			// TODO `evictPersona` should possibly do this `evictCommunity` itself
			if (community_id) evictCommunity(ui, community_id);
			evictPersona(ui, persona);
		});
	}
	return result;
};
