<script lang="ts">
	import type {Readable} from '@getloom/svelte-gettable-stores';

	import TextInput from '$lib/ui/TextInput.svelte';
	import {getApp} from '$lib/ui/app.js';
	import {getSpaceContext} from '$lib/vocab/view/view.js';
	import type {Entity} from '$lib/vocab/entity/entity.js';
	import type {BudgetItem} from '$lib/plugins/budget/Budget.svelte'

	import {to_contextmenu_params} from '@ryanatkn/fuz/contextmenu.js';	
	import EntityContextmenu from '$lib/ui/EntityContextmenu.svelte';			

	const {actor, space} = getSpaceContext();

	const {ui: {contextmenu}, actions} = getApp();

	export let entity: Readable<Entity> | undefined;		
	export let el: HTMLTextAreaElement | undefined = undefined;
    export let incomePath: string;

	let text = '';
	let entityData: BudgetItem | undefined = $entity?.data.content ? $entity.data.content as any as BudgetItem : undefined

	const createEntity = async () => {
		const value = text.trim(); // TODO parse to trim? regularize step?        
		if (!value) {
			el?.focus();
			return;
		}

		const content: BudgetItem = {
			category: "paycheck",
			value: +value,
			itemType: "INCOME"
		}		

		//TODO better error handling
		await actions.CreateEntity({
			actor: $actor.actor_id,
			space_id: $space.space_id,
			data: {type: "BudgetItem", content: JSON.stringify(content)},
            path: incomePath,
            ties: [{source_id: $space.directory_id}],
		});
		text = '';
	};
	const onSubmit = async () => {
		await createEntity();
	};
</script>
{#if !entity}
	<TextInput
		placeholder=">what is your income per month?"
		attrs={{style: 'height: var(--input_height)'}}
		{actor}
		on:submit={onSubmit}
		bind:value={text}
		bind:el
	/>
	<button on:click={createEntity}>add income</button>
{:else}
	<div use:contextmenu.action={[		
		to_contextmenu_params(EntityContextmenu, {actor, entity}),
	]}>	
	category: {entityData?.category} || value: {entityData?.value}	
	</div>
{/if}