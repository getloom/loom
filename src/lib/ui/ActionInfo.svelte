<script lang="ts">
	import {toDialogParams} from '@feltjs/felt-ui/dialog.js';

	import type {ActionData} from '$lib/vocab/action/action';
	import CreateActionForm from '$lib/ui/CreateActionForm.svelte';
	import {getApp} from '$lib/ui/app';
	import SchemaInfo from '$lib/ui/SchemaInfo.svelte';

	const {
		actions,
		ui: {actorSelection},
	} = getApp();

	$: selectedActor = $actorSelection;

	export let action: ActionData;
</script>

<div class="action_info">
	<div class="title">
		<div>
			<span class="name">{action.name}</span>
			<small class="type">{action.type}</small>
		</div>
		<button
			type="button"
			class="plain"
			on:click={() => {
				if (selectedActor) {
					actions.OpenDialog(
						toDialogParams(
							CreateActionForm,
							{actor: selectedActor, selectedActionData: action},
							{layout: 'page'},
						),
					);
				}
			}}
		>
			create
		</button>
	</div>
	{#if action.type !== 'ClientAction'}
		<div class="property">
			<span class="name">path</span>
			<span>{action.route.method}</span>
			<span>{action.route.path}</span>
		</div>
	{/if}
	<div class="property">
		<span class="name">params</span>
		<!-- TODO display the generated type string instead of the schema,
    probably by generating a sibling file to `actions.ts` like `eventTypeStrings.ts` -->
		{#if action.params}
			<SchemaInfo schema={action.params} />
		{:else}
			<code>null</code>
		{/if}
	</div>
	{#if action.type !== 'ClientAction'}
		<div class="property">
			<span class="name">response</span>
			<!-- TODO display the generated type string instead of the schema,
      probably by generating a sibling file to `actions.ts` like `eventTypeStrings.ts` -->
			<SchemaInfo schema={action.response} />
		</div>
	{/if}
	<div class="property">
		<span class="name">returns</span>
		<pre>{action.returns}</pre>
	</div>
</div>

<style>
	.action_info {
		background-color: var(--fg_1);
		border-radius: var(--border_radius_sm);
		width: 100%;
	}
	.title {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.title .name {
		font-size: var(--size_lg);
	}
	.name {
		padding: var(--spacing_md);
		font-family: var(--font_family_mono);
	}
	.type {
		padding: var(--spacing_lg);
		font-family: var(--font_family_mono);
	}
	.property {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		padding: var(--spacing_md) var(--spacing_md) var(--spacing_md) var(--spacing_xl4);
		overflow: auto;
	}
	.property > span {
		display: flex;
		width: 100px;
	}
</style>
