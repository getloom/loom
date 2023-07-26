<script lang="ts">
	import type {ClientActionData, ServiceActionData} from '$lib/vocab/action/action';
	import type {ViewTemplate} from '$lib/vocab/view/view';
	import type {VocabSchema} from '@feltjs/gro';

	import SchemaInfo from '$lib/ui/SchemaInfo.svelte';
	import ActionInfo from '$lib/ui/ActionInfo.svelte';
	import ViewInfo from '$lib/ui/ViewInfo.svelte';
	import {base} from '$app/paths';

	export let sortedViewTemplates: ViewTemplate[];
	export let sortedModelSchemas: VocabSchema[];
	export let serviceActions: ServiceActionData[];
	export let clientActions: ClientActionData[];
	export let schemaNames: string[];
</script>

<div class="prose padded_xl">
	<h1 id="vocab">vocab</h1>
	<aside>
		The felt-server vocabulary is published as a <a href="https://json-schema.org/">JSON Schema</a>
		on
		<a href="https://github.com/feltjs/felt-server/blob/main/src/static/schemas/vocab.json"
			>on GitHub</a
		>
		and on this website at <a href="{base}/schemas/vocab.json">{base}/schemas/vocab.json</a>.
	</aside>
</div>
<div class="prose padded_xl">
	<h2 id="views">views</h2>
</div>
<ul>
	{#each sortedViewTemplates as view}
		<li id={view.name}>
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
		<li id={name}>
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
		<li id={action.name}>
			<ActionInfo {action} />
		</li>
	{/each}
</ul>
<div class="prose padded_xl">
	<h2 id="client_actions">client actions</h2>
</div>
<ul>
	{#each clientActions as action}
		<li id={action.name}>
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
</style>
