import {goto} from '$app/navigation';

import type {Mutations} from '$lib/app/eventTypes';
import {isHomeSpace} from '$lib/vocab/space/spaceHelpers';
import {deleteEntity} from '$lib/vocab/entity/entityMutationHelpers';
import {upsertSpaces} from './spaceMutationHelpers';

export const CreateSpace: Mutations['CreateSpace'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {space: $space, directory: $directory} = result.value;
	upsertSpaces(ui, [$space], [$directory]);
	return result;
};

export const DeleteSpace: Mutations['DeleteSpace'] = async ({params, invoke, ui}) => {
	const {
		communityById,
		spaceIdSelectionByCommunityId,
		spacesByCommunityId,
		spaceById,
		spaces,
		communitySelection,
	} = ui;
	const result = await invoke();
	if (!result.ok) return result;

	const {space_id} = params;
	const space = spaceById.get(space_id)!;
	const $space = space.get();
	const {community_id} = $space;
	const {deletedEntityIds} = result.value;

	// If the deleted space is selected, select the home space as a fallback.
	if (space_id === spaceIdSelectionByCommunityId.get().value.get(community_id)) {
		const community = communityById.get(community_id)!;
		if (community === communitySelection.get()) {
			await goto('/' + community.get().name + location.search, {replaceState: true});
		} else {
			//TODO lookup space by community_id+url (see this comment in multiple places)
			const homeSpace = spacesByCommunityId
				.get()
				.get(community_id)!
				.find((s) => isHomeSpace(s.get()))!;
			spaceIdSelectionByCommunityId.mutate(($s) => {
				$s.set(community_id, homeSpace.get().space_id);
			});
		}
	}

	spaceById.delete(space_id);
	spaces.mutate(($spaces) => $spaces.splice($spaces.indexOf(space), 1));
	for (const entity_id of deletedEntityIds) {
		deleteEntity(ui, entity_id);
	}

	return result;
};

export const UpdateSpace: Mutations['UpdateSpace'] = async ({invoke, params, ui: {spaceById}}) => {
	const result = await invoke();
	if (!result.ok) return result;
	//TODO maybe return to $entity naming convention OR propagate this pattern?
	const {space: updatedSpace} = result.value;
	const space = spaceById.get(params.space_id);
	space!.set(updatedSpace);
	return result;
};
