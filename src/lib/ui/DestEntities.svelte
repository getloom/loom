<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import {getApp} from '$lib/ui/app.js';
	import type {Entity} from '$lib/vocab/entity/entity.js';
	import EntitiesAndTie from '$lib/ui/EntitiesAndTie.svelte';
	import type {AccountActor} from '$lib/vocab/actor/actor.js';

	export let actor: Readable<AccountActor>;
	export let entity: Readable<Entity>;

	const {
		ui: {tiesBySourceId, entityById},
	} = getApp();

	$: destTiesSet = tiesBySourceId.get($entity.entity_id);
	$: destTies = $destTiesSet?.value && Array.from($destTiesSet.value);
	$: destEntities = destTies?.map((t) => entityById.get(t.dest_id)!);
</script>

{#if destTies && destEntities?.length}
	<fieldset>
		<legend>dest entities</legend>
		{#each destEntities as destEntity, i (destEntity)}
			<EntitiesAndTie {actor} sourceEntity={entity} {destEntity} tie={destTies[i]} />
		{/each}
	</fieldset>
{/if}
<!-- TODO maybe show a PendingAnimation in some state? -->
