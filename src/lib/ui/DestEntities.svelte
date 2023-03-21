<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import {getApp} from '$lib/ui/app';
	import type {Entity} from '$lib/vocab/entity/entity';
	import EntitiesAndTie from '$lib/ui/EntitiesAndTie.svelte';
	import type {AccountPersona} from '$lib/vocab/actor/persona';

	export let persona: Readable<AccountPersona>;
	export let entity: Readable<Entity>;

	const {
		ui: {destTiesBySourceEntityId, entityById},
	} = getApp();

	$: destTiesSet = destTiesBySourceEntityId.get($entity.entity_id);
	$: destTies = $destTiesSet?.value && Array.from($destTiesSet.value);
	$: destEntities = destTies?.map((t) => entityById.get(t.dest_id)!);
</script>

{#if destTies && destEntities?.length}
	<fieldset>
		<legend>dest entities</legend>
		{#each destEntities as destEntity, i (destEntity)}
			<EntitiesAndTie {persona} sourceEntity={entity} {destEntity} tie={destTies[i]} />
		{/each}
	</fieldset>
{/if}
<!-- TODO maybe show a PendingAnimation in some state? -->
