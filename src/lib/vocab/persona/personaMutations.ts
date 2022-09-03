import type {Mutations} from '$lib/app/eventTypes';
import {upsertPersonas} from '$lib/vocab/persona/personaMutationHelpers';
import {upsertCommunity} from '$lib/vocab/community/communityMutationHelpers';

export const CreateAccountPersona: Mutations['CreateAccountPersona'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {
		persona: $persona,
		community: $community,
		spaces: $spaces,
		directories: $directories,
		membership: $membership,
	} = result.value;
	upsertPersonas(ui, [$persona]);
	upsertCommunity(ui, $community, $spaces, $directories, [$membership]);
	return result;
};
