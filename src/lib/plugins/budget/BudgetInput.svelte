<script lang="ts">
	import type {Readable} from '@getloom/svelte-gettable-stores';

	import TextInput from '$lib/ui/TextInput.svelte';
	import {getApp} from '$lib/ui/app.js';
	import {getSpaceContext} from '$lib/vocab/view/view.js';
	import type {Entity} from '$lib/vocab/entity/entity.js';
	import type {BudgetItem} from './Budget.svelte';

	const {actor, space} = getSpaceContext();

	const {actions} = getApp();

	export let list: Readable<Entity>;
	export let el1: HTMLTextAreaElement | undefined = undefined;
	export let el2: HTMLTextAreaElement | undefined = undefined;

	let categoryInput = '';
	let valueInput = '';
	let checked = false;

	$: buttonText = checked ? 'income' : 'expense';

	const createEntity = async () => {
		const category = categoryInput.trim(); // TODO parse to trim? regularize step?
		if (!category) {
			el1?.focus();
			return;
		}

		const value = valueInput.trim();
		if (!value) {
			el2?.focus();
			return;
		}

		const content: BudgetItem = {
			category,
			value: +value,
			itemType: checked ? 'INCOME' : 'EXPENSE',
		};

		//TODO better error handling
		await actions.CreateEntity({
			actor: $actor.actor_id,
			space_id: $space.space_id,
			data: {type: 'BudgetItem', content: content as any as string},
			ties: [{source_id: $list.entity_id}],
		});
		categoryInput = '';
		valueInput = '';
		checked = false;
	};
	const onSubmit = async () => {
		await createEntity();
	};
</script>

<!-- add category, value, and type inputs-->
<input type="checkbox" bind:checked />
<TextInput
	placeholder="category"
	attrs={{style: 'height: var(--input_height)'}}
	{actor}
	on:submit={onSubmit}
	bind:value={categoryInput}
	bind:el={el1}
	showAvatar={false}
/>
<TextInput
	placeholder="value"
	attrs={{style: 'height: var(--input_height)'}}
	{actor}
	on:submit={onSubmit}
	bind:value={valueInput}
	bind:el={el2}
	showAvatar={false}
/>
<button on:click={createEntity}>add {buttonText} category</button>
