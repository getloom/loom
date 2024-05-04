<script lang="ts" context="module">
	export interface ActionHistoryItem {
		name: string;
		params: any; // TODO ?
		actionData: ActionData;
		created: number;
		responded: number;
		elapsed: number;
		error: string | null;
	}
</script>

<script lang="ts">
	import type {Writable} from '@getloom/svelte-gettable-stores';

	import type {ActionData} from '$lib/vocab/action/action.js';
	import {createEventDispatcher} from 'svelte';

	const dispatch = createEventDispatcher<{
		perform: {actionData: ActionData; params: any};
		remove: ActionHistoryItem;
		clear: void;
	}>();

	export let actionHistory: Writable<ActionHistoryItem[]>;
</script>

{#if $actionHistory.length}
	<div class="action_history">
		<button
			type="button"
			class="plain"
			on:click={() => {
				dispatch('clear');
			}}
		>
			clear history
		</button>
		<!-- TODO extract table component with sortable headings -->
		<table class="panel">
			<thead><th>action</th><th>time</th><th /><th>props</th><th>error</th></thead>
			<tbody>
				{#each $actionHistory as item (item)}
					<tr>
						<td><code class={item.actionData.type}>{item.name}</code></td>
						<td>{Math.round(item.elapsed)}ms</td>
						<td>
							<div class="buttons">
								<button
									class="plain icon_button"
									style:--icon_size="var(--icon_size_sm)"
									type="button"
									title="perform {item.actionData.name} again"
									on:click={() => {
										dispatch('perform', item);
									}}
								>
									↪
								</button>
								<button
									class="plain icon_button"
									style:--icon_size="var(--icon_size_sm)"
									type="button"
									title="remove history item"
									on:click={() => {
										dispatch('remove', item);
									}}
								>
									✕
								</button>
							</div>
						</td>
						<td><code class="ellipsis">{JSON.stringify(item.params)}</code></td>
						<td
							>{#if item.error}<small class="error_text ellipsis" title={item.error}
									>{item.error}</small
								>{/if}</td
						>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

<style>
	.action_history {
		overflow: auto;
		width: 100%;
	}
	th,
	td {
		padding: 0 var(--spacing_xs);
	}
	.error_text,
	code.ellipsis {
		max-width: 150px;
	}
</style>
