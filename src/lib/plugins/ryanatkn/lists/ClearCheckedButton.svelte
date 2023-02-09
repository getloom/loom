<script lang="ts">
	import {derived, type Readable} from '@feltcoop/svelte-gettable-stores';
	import {slide} from 'svelte/transition';
	import {plural} from '@feltjs/util/string.js';

	import {getApp} from '$lib/ui/app';
	import type {Entity} from '$lib/vocab/entity/entity';
	import {getViewContext} from '$lib/vocab/view/view';

	const viewContext = getViewContext();
	$: ({persona} = $viewContext);

	const {
		dispatch,
		ui: {destTiesBySourceEntityId, entityById},
	} = getApp();

	export let list: Readable<Entity>;

	$: destTies = destTiesBySourceEntityId.get($list.entity_id);
	$: items =
		$destTies &&
		Array.from($destTies.value).reduce((acc, tie) => {
			if (tie.type === 'HasItem') {
				const entity = entityById.get(tie.dest_id)!;
				acc.push(entity);
			}
			return acc;
		}, [] as Array<Readable<Entity>>);
	$: checkedItems =
		items &&
		derived(items, ($items) => {
			const results = [];
			if (items) {
				for (let i = 0; i < $items.length; i++) {
					if ($items[i].data.checked) results.push(items[i]);
				}
			}
			return results;
		});
	$: checkedCount = $checkedItems?.length;

	const clearDone = async () => {
		if (!checkedCount) return;
		const entityIds = $checkedItems!.map((i) => i.get().entity_id);
		await dispatch.DeleteEntities({
			actor: $persona.persona_id,
			entityIds,
		});
	};
</script>

{#if checkedCount}
	<div transition:slide|local class="wrapper">
		<button on:click={clearDone}>remove {checkedCount} checked item{plural(checkedCount)}</button>
	</div>
{/if}

<style>
	.wrapper {
		padding-left: var(--input_height);
	}
</style>
