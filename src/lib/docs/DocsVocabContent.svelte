<script lang="ts">
	import type {VocabSchema} from '@feltjs/gro';
	import type {Mutable} from '@feltcoop/svelte-gettable-stores';
	import {base} from '$app/paths';
	import {intersect} from '@fuz.dev/intersect';

	import type {ViewTemplate} from '$lib/vocab/view/view';
	import type {ClientActionData, ServiceActionData} from '$lib/vocab/action/action';
	import SchemaInfo from '$lib/ui/SchemaInfo.svelte';
	import ActionInfo from '$lib/ui/ActionInfo.svelte';
	import ViewInfo from '$lib/ui/ViewInfo.svelte';

	export let sortedViewTemplates: ViewTemplate[];
	export let sortedModelSchemas: VocabSchema[];
	export let serviceActions: ServiceActionData[];
	export let clientActions: ClientActionData[];
	export let schemaNames: string[];

	/**
	 * Optionally specify if the link should be displayed as selected via a set of matching names.
	 */
	export let selections: Mutable<Set<string>> | undefined = undefined;
</script>

<div class="prose padded_xl">
	<h1 id="vocab">vocab</h1>
	<aside>
		The felt-server vocabulary is published as a <a href="https://json-schema.org/">JSON Schema</a>
		on
		<a href="https://github.com/feltjs/felt-server/blob/main/src/static/schemas/vocab.json"
			>GitHub</a
		>
		and on this website at
		<a href="{base}/schemas/vocab.json" download>{base}/schemas/vocab.json</a>.
	</aside>
</div>
<div class="prose padded_xl">
	<h2 id="views">views</h2>
</div>
<ul>
	{#each sortedViewTemplates as view}
		<li
			id={view.name}
			class="view panel"
			use:intersect={(intersecting) => {
				selections?.mutate((v) => (intersecting ? v.add(view.name) : v.delete(view.name)));
			}}
		>
			<ViewInfo {view} />
		</li>
	{/each}
</ul>
<hr />
<div class="prose padded_xl">
	<h2 id="models">models</h2>
</div>
<ul>
	{#each sortedModelSchemas as schema, i}
		{@const name = schemaNames[i]}
		<li
			id={name}
			use:intersect={(intersecting) => {
				selections?.mutate((v) => (intersecting ? v.add(name) : v.delete(name)));
			}}
		>
			<SchemaInfo {schema} />
		</li>
	{/each}
</ul>
<hr />
<div class="prose padded_xl">
	<h2 id="service_actions">service actions</h2>
</div>
<ul>
	{#each serviceActions as action}
		<li
			id={action.name}
			use:intersect={(intersecting) => {
				selections?.mutate((v) => (intersecting ? v.add(action.name) : v.delete(action.name)));
			}}
		>
			<ActionInfo {action} />
		</li>
	{/each}
</ul>
<div class="prose padded_xl">
	<h2 id="client_actions">client actions</h2>
</div>
<ul>
	{#each clientActions as action}
		<li
			id={action.name}
			use:intersect={(intersecting) => {
				selections?.mutate((v) => (intersecting ? v.add(action.name) : v.delete(action.name)));
			}}
		>
			<ActionInfo {action} />
		</li>
	{/each}
</ul>

<style>
	li {
		display: flex;
		flex-direction: column;
		padding: var(--spacing_xl3) 0;
	}
	.view {
		padding: var(--spacing_lg);
		margin-bottom: var(--spacing_xl4);
	}
</style>
