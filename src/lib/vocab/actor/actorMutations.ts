import type {Mutations} from '$lib/app/actionTypes';
import {stashPersonas, evictPersona} from '$lib/vocab/actor/actorMutationHelpers';
import {evictHub, stashHubs} from '$lib/vocab/hub/hubMutationHelpers';
import {stashRoles} from '$lib/vocab/role/roleMutationHelpers';
import {stashSpaces} from '$lib/vocab/space/spaceMutationHelpers';
import {stashAssignments} from '$lib/vocab/assignment/assignmentMutationHelpers';
import {stashPolicies} from '$lib/vocab/policy/policyMutationHelpers';

export const CreateAccountActor: Mutations['CreateAccountActor'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {personas, hubs, roles, policies, spaces, directories, assignments} = result.value;
	ui.mutate(() => {
		stashPersonas(ui, personas);
		stashHubs(ui, hubs);
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
	const {targetActor} = params;
	const persona = ui.personaById.get(targetActor);
	if (persona) {
		ui.mutate(() => {
			const $persona = persona.get();
			const hub_id = 'hub_id' in $persona ? $persona.hub_id : null;
			// TODO `evictPersona` should possibly do this `evictHub` itself
			if (hub_id) evictHub(ui, hub_id);
			evictPersona(ui, persona);
		});
	}
	return result;
};
