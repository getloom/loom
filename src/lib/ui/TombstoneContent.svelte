<script lang="ts">
	import type {Readable} from '@getloom/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity.js';
	import type {TombstoneEntityData} from '$lib/vocab/entity/entityData.js';

	// TODO probably want to support generic entity, `Entity<TombstoneEntityData>`.
	// Another solution would be to check if the entity prop is type `Tombstone` and handle the other case,
	// but that's overly defensive and should be a parent component concern checked by types.
	export let entity: Readable<Entity>;

	$: formerType = ($entity.data as TombstoneEntityData).formerType || 'entity'; // TODO delete this typecast after finishing the above TODO

	// TODO optionally render `$entity.data.deleted`
</script>

<span>🪦 <i>this {formerType} was erased</i></span>

<style>
	i {
		display: inline;
	}
</style>
