<script lang="ts">
	import Mural from '@getloom/mural/Mural.svelte';
	import type {Mural_Action} from '@getloom/mural/item.js';
	import {onDestroy} from 'svelte';

	import {getSpaceContext} from '$lib/vocab/view/view.js';
	import {getApp} from '$lib/ui/app.js';

	const {actor, space} = getSpaceContext();

	const {
		actions,
		ui: {ephemera},
	} = getApp();

	let handle_action: (action: Mural_Action) => any;

	// fixed dimensions so it's consistent for multiple users at once - not great, is there another way?
	const width = 800;
	const height = 400;

	const brodcastAction = (action: Mural_Action): void => {
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
				handle_action(v.data as any); // don't forward the space_id
			}
		}),
	);
</script>

<div class="mural_wrapper panel">
	<Mural {width} {height} bind:handle_action on:action={(e) => brodcastAction(e.detail)} />
</div>

<style>
	.mural_wrapper {
		display: flex;
		flex: 1;
	}
</style>
