<script lang="ts">
	import {toDialogParams} from '@feltjs/felt-ui/dialog.js';

	import type {ActionData} from '$lib/vocab/action/action';
	import CreateActionForm from '$lib/ui/CreateActionForm.svelte';
	import {getApp} from '$lib/ui/app';

	const {
		actions,
		ui: {actorSelection},
	} = getApp();

	$: selectedActor = $actorSelection;

	export let action: ActionData;
</script>

<div class="action_info">
	<div class="title">
		<div class="row">
			<code class="name">{action.name}</code>
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
		<small class="type">{action.type}</small>
	</div>
	{#if action.type !== 'ClientAction'}
		<div class="property">
			<span>path</span>
			<span>{action.route.method}</span>
			<span>{action.route.path}</span>
		</div>
	{/if}
	<div class="property">
		<span>params</span>
		<!-- TODO display the generated type string instead of the schema,
    probably by generating a sibling file to `actions.ts` like `eventTypeStrings.ts` -->
		<pre>{JSON.stringify(action.params, null, 2)}</pre>
	</div>
	{#if action.type !== 'ClientAction'}
		<div class="property">
			<span>response</span>
			<!-- TODO display the generated type string instead of the schema,
      probably by generating a sibling file to `actions.ts` like `eventTypeStrings.ts` -->
			<pre>{JSON.stringify(action.response, null, 2)}</pre>
		</div>
	{/if}
	<div class="property">
		<span>returns</span>
		<pre>{action.returns}</pre>
	</div>
</div>

<style>
	.title {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.name {
		font-size: var(--size_lg);
		padding: var(--spacing_md);
		border-bottom-left-radius: 0;
		border-bottom-right-radius: 0;
	}
	.type {
		padding: var(--spacing_lg);
		background: none;
		font-family: var(--font_family_mono);
	}
	.property {
		display: flex;
		align-items: center;
		padding: var(--spacing_md) var(--spacing_md) var(--spacing_md) var(--spacing_xl4);
		background-color: var(--fg_1);
		overflow: auto;
	}
	.property:nth-child(2n + 1) {
		background-color: var(--fg_0);
	}
	.property > span {
		display: flex;
		width: 100px;
	}
</style>
