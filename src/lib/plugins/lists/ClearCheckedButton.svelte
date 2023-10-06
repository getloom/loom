<script lang="ts">
	import {derived, type Readable} from '@feltcoop/svelte-gettable-stores';
	import {slide} from 'svelte/transition';
	import {plural} from '@grogarden/util/string.js';

	import {getApp} from '$lib/ui/app.js';
	import type {Entity} from '$lib/vocab/entity/entity.js';
	import {getSpaceContext} from '$lib/vocab/view/view.js';

	const {actor} = getSpaceContext();

	const {
		actions,
		ui: {tiesBySourceId, entityById},
	} = getApp();

	export let list: Readable<Entity>;

	$: destTies = tiesBySourceId.get($list.entity_id);
	$: items =
		$destTies &&
		Array.from($destTies.value).reduce(
			(acc, tie) => {
				if (tie.type === 'HasItem') {
					const entity = entityById.get(tie.dest_id)!;
					acc.push(entity);
				}
				return acc;
			},
			[] as Array<Readable<Entity>>,
		);
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
		await actions.DeleteEntities({
			actor: $actor.actor_id,
			entityIds,
		});
	};
</script>

{#if checkedCount}
	<div transition:slide class="wrapper">
		<button on:click={clearDone}>remove {checkedCount} checked item{plural(checkedCount)}</button>
	</div>
{/if}

<style>
	.wrapper {
		padding-left: var(--input_height);
	}
</style>
