<script lang="ts">
	import type {Readable} from '@getloom/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity.js';
	import EntityCell from '$lib/ui/EntityCell.svelte';
	import type {AccountActor} from '$lib/vocab/actor/actor.js';

	export let actor: Readable<AccountActor>;
	export let entity: Readable<Entity>;

	$: properties = Object.keys($entity);
</script>

<table>
	<thead>
		{#each properties as propertyName (propertyName)}
			<td>{propertyName}</td>
		{/each}
	</thead>
	<tbody>
		<tr>
			{#each properties as propertyName (propertyName)}
				<td><EntityCell {actor} {entity} {propertyName} /></td>
			{/each}
		</tr>
	</tbody>
</table>

<style>
	thead {
		font-weight: 700;
	}
	thead td {
		padding-right: var(--spacing_lg);
	}
</style>
