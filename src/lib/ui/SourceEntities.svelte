<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import {getApp} from '$lib/ui/app';
	import type {Entity} from '$lib/vocab/entity/entity';
	import EntitiesAndTie from '$lib/ui/EntitiesAndTie.svelte';
	import type {AccountPersona} from '$lib/vocab/persona/persona';

	export let persona: Readable<AccountPersona>;
	export let entity: Readable<Entity>;

	const {
		ui: {sourceTiesByDestEntityId, entityById},
	} = getApp();

	$: sourceTiesSet = sourceTiesByDestEntityId.get($entity.entity_id);
	$: sourceTies = $sourceTiesSet?.value && Array.from($sourceTiesSet.value);
	$: sourceEntities = sourceTies?.map((t) => entityById.get(t.source_id)!);
</script>

{#if sourceTies && sourceEntities?.length}
	<fieldset>
		<legend>source entities</legend>
		{#each sourceEntities as sourceEntity, i (sourceEntity)}
			<EntitiesAndTie {persona} destEntity={entity} {sourceEntity} tie={sourceTies[i]} />
		{/each}
	</fieldset>
{/if}
<!-- TODO maybe show a PendingAnimation in some state? -->
