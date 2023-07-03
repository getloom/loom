<script lang="ts">
	import Mural from '@feltjs/felt-mural/Mural.svelte';
	import type {MuralAction} from '@feltjs/felt-mural/entity.js';
	import {onDestroy} from 'svelte';

	import {getSpaceContext} from '$lib/vocab/view/view';
	import {getApp} from '$lib/ui/app';

	const {actor, space} = getSpaceContext();

	const {
		actions,
		ui: {ephemera},
	} = getApp();

	let handleAction: (action: MuralAction) => any;

	// fixed dimensions so it's consistent for multiple users at once - not great, is there another way?
	const width = 800;
	const height = 400;

	const brodcastAction = (action: MuralAction): void => {
		void actions.Ephemera({
			actor: $actor.actor_id,
			space_id: $space.space_id,
			data: action as any, // TODO type
		});
	};

	// Forward ephemera to the mural, subscribing manually to avoid the component-level batching.
	// Demo of the problem: https://svelte.dev/repl/69e1c9327ce847b0af642ed3163201da?version=3.57.0
	onDestroy(
		ephemera.subscribe((v) => {
			if (
				v && // there may be no ephemera
				v.space_id === $space.space_id && // scope to this space
				v.actor !== $actor.actor_id // don't forward ephemera created by the user
			) {
				handleAction(v.data as any); // don't forward the space_id
			}
		}),
	);
</script>

<div class="mural_wrapper panel">
	<Mural {width} {height} bind:handleAction on:action={(e) => brodcastAction(e.detail)} />
</div>

<style>
	.mural_wrapper {
		display: flex;
		flex: 1;
	}
</style>
