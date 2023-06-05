<script lang="ts">
	import type {VocabSchema} from '@feltjs/gro';
	import {stripStart} from '@feltjs/util/string.js';
	import type {JSONSchema} from '@ryanatkn/json-schema-to-typescript';

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
				<code class="name">{stripStart(schema.$id, '/schemas/')}</code>
			{/if}
			<small class="type">{schema.type || 'unknown'}</small>
		</div>
		{#if schema.description}
			<div class="description">
				{schema.description}
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
		display: flex;
		align-items: center;
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
