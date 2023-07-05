<script lang="ts">
	import type {VocabSchema} from '@feltjs/gro';
	import type {JSONSchema} from '@ryanatkn/json-schema-to-typescript';

	import SvastText from '$lib/ui/SvastText.svelte';
	import {toSchemaName} from '$lib/util/schema';
	import Vocab from '$lib/plugins/vocab/Vocab.svelte';

	export let schema: VocabSchema;

	let properties: undefined | Array<[string, JSONSchema]>;
	$: properties = schema.properties && Array.from(Object.entries(schema.properties));
</script>

<div>
	{#if typeof schema === 'boolean'}
		<div class="title">
			<code class="name">{schema}</code>
		</div>
	{:else}
		<div class="title">
			{#if schema.$id}
				<code class="name">{toSchemaName(schema.$id)}</code>
			{/if}
			<small class="type">
				{#if schema.$ref}
					{@const name = toSchemaName(schema.$ref)}
					{#if name}
						<Vocab {name} />
					{:else}
						unknown
					{/if}
				{:else if schema.type}
					{schema.type}
				{:else if schema.anyOf}
					union
				{:else}
					unknown
				{/if}
			</small>
		</div>
		{#if schema.description}
			<div class="description prose">
				<SvastText text={schema.description} />
			</div>
		{/if}
		{#if properties}
			{#each properties as [propertyName, propertySchema]}
				<div class="property">
					<span class="name">{propertyName}</span>
					<small class="required">
						<!-- TODO cache this on a viewmodel? -->
						{#if Array.isArray(schema.required) && schema.required.includes(propertyName)}
							<!-- leave blank? -->
						{:else}
							<span title="{propertyName} is optional">?</span>
						{/if}
					</small>
					<svelte:self schema={propertySchema} />
				</div>
			{/each}
		{/if}
	{/if}
</div>

<style>
	.title {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.title .name {
		font-size: var(--size_lg);
		padding: var(--spacing_md);
		font-family: var(--font_family_mono);
		border-bottom-left-radius: 0;
		border-bottom-right-radius: 0;
	}
	.type {
		padding: var(--spacing_lg);
		background: none;
		font-family: var(--font_family_mono);
	}
	.description {
		background-color: var(--fg_1);
		padding: var(--spacing_md);
	}
	.property {
		display: flex;
		align-items: center;
		padding: var(--spacing_md) var(--spacing_md) var(--spacing_md) var(--spacing_xl4);
		background-color: var(--fg_1);
	}
	.property:nth-child(2n + 1) {
		background-color: var(--fg_0);
	}
	.property .name {
		display: flex;
		width: 180px;
	}
	.required {
		display: flex;
		width: 30px;
	}
</style>
