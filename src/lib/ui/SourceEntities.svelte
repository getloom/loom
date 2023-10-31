<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import {getApp} from '$lib/ui/app.js';
	import type {Entity} from '$lib/vocab/entity/entity.js';
	import EntitiesAndTie from '$lib/ui/EntitiesAndTie.svelte';
	import type {AccountActor} from '$lib/vocab/actor/actor.js';

	export let actor: Readable<AccountActor>;
	export let entity: Readable<Entity>;

	const {
		ui: {tiesByDestId, entityById},
	} = getApp();

	$: sourceTiesSet = tiesByDestId.get($entity.entity_id);
	$: sourceTies = $sourceTiesSet?.value && Array.from($sourceTiesSet.value);
	$: sourceEntities = sourceTies?.map((t) => entityById.get(t.source_id)!);
</script>

{#if sourceTies && sourceEntities?.length}
	<fieldset>
		<legend>source entities</legend>
		{#each sourceEntities as sourceEntity, i (sourceEntity)}
			<EntitiesAndTie {actor} destEntity={entity} {sourceEntity} tie={sourceTies[i]} />
		{/each}
	</fieldset>
{/if}
<!-- TODO maybe show a Pending_Animation in some state? -->
