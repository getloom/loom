import type {Mutations} from '$lib/app/eventTypes';
import {upsertPersonas} from '$lib/vocab/persona/personaMutationHelpers';
import {upsertCommunity} from '$lib/vocab/community/communityMutationHelpers';
import {stashRoles} from '$lib/vocab/role/roleMutationHelpers';

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
	upsertPersonas(ui, [$persona]);
	upsertCommunity(ui, $community, $spaces, $directories, [$membership]);
	stashRoles(ui, [$role]);
	return result;
};
