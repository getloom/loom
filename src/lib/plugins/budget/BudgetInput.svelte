<script lang="ts">
	import type {Readable} from '@getloom/svelte-gettable-stores';

	import TextInput from '$lib/ui/TextInput.svelte';
	import {getApp} from '$lib/ui/app.js';
	import {getSpaceContext} from '$lib/vocab/view/view.js';
	import type {Entity} from '$lib/vocab/entity/entity.js';

	const {actor, space} = getSpaceContext();

	const {actions} = getApp();

	export let list: Readable<Entity>;
	export let el: HTMLTextAreaElement | undefined = undefined;

	let text = '';

	const createEntity = async () => {
		const content = text.trim(); // TODO parse to trim? regularize step?
		if (!content) {
			el?.focus();
			return;
		}

		//TODO better error handling
		await actions.CreateEntity({
			actor: $actor.actor_id,
			space_id: $space.space_id,
			data: {content},
			ties: [{source_id: $list.entity_id}],
		});
		text = '';
	};
	const onSubmit = async () => {
		await createEntity();
	};
</script>

<TextInput
	placeholder=">"
	attrs={{style: 'height: var(--input_height)'}}
	{actor}
	on:submit={onSubmit}
	bind:value={text}
	bind:el
/>
<button on:click={createEntity}>add item</button>
