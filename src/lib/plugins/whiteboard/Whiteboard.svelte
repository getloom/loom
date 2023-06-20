<script lang="ts">
	import Whiteboard from '@feltjs/felt-ui/Whiteboard.svelte';
	import type {WhiteboardAction} from '@feltjs/felt-ui/entity.js';
	import {onDestroy} from 'svelte';

	import {getSpaceContext} from '$lib/vocab/view/view';
	import {getApp} from '$lib/ui/app';

	const {actor, space} = getSpaceContext();

	const {
		actions,
		ui: {ephemera},
	} = getApp();

	let pointerDown: boolean | undefined;
	let pointerX: number | undefined;
	let pointerY: number | undefined;
	let scale: number | undefined;
	let handleAction: (action: WhiteboardAction) => any;

	const width = 800;
	const height = 400;

	const brodcastAction = (action: WhiteboardAction): void => {
		void actions.Ephemera({
			actor: $actor.actor_id,
			space_id: $space.space_id,
			data: action as any, // TODO type
		});
	};

	// Forward ephemera to the whiteboard, subscribing manually to avoid the component-level batching.
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

<div class="whiteboard-wrapper panel">
	<Whiteboard
		{width}
		{height}
		bind:pointerDown
		bind:pointerX
		bind:pointerY
		bind:scale
		bind:handleAction
		on:action={(e) => brodcastAction(e.detail)}
	/>
</div>

<style>
	.whiteboard-wrapper {
		display: flex;
		flex: 1;
	}
</style>
