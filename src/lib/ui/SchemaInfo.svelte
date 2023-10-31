<script lang="ts">
	import type {Json_Schema} from '@grogarden/gro/schema.js';
	import type {JSONSchema} from '@ryanatkn/json-schema-to-typescript';

	import SvastText from '$lib/ui/SvastText.svelte';
	import {toSchemaName} from '$lib/util/schema.js';
	import Vocab from '$lib/plugins/vocab/Vocab.svelte';

	export let schema: Json_Schema;

	let properties: undefined | Array<[string, JSONSchema]>;
	$: properties = schema.properties && Array.from(Object.entries(schema.properties));

	$: ({$id: id, $ref: ref, type, anyOf, description, required} = schema);

	$: name = id && toSchemaName(id);
</script>

<div class="schema_info">
	{#if typeof schema === 'boolean'}
		<div class="title">
			<span class="name">{schema}</span>
		</div>
	{:else}
		<div class="title">
			{#if name}
				<span class="name">{name}</span>
			{/if}
			<small class="type">
				{#if ref}
					<Vocab name={toSchemaName(ref)} />
				{:else if type}
					{type}
				{:else if anyOf}
					union
				{:else}
					unknown
				{/if}
			</small>
		</div>
		{#if description}
			<div class="description prose">
				<SvastText text={description} />
			</div>
		{/if}
		{#if properties}
			{#each properties as [propertyName, propertySchema]}
				<div class="property">
					<span class="name">{propertyName}</span>
					<small class="required">
						<!-- TODO cache this on a viewmodel? -->
						{#if Array.isArray(required) && required.includes(propertyName)}
							<!-- leave blank? -->
						{:else}
							<span title="{propertyName} is optional">?</span>
						{/if}
					</small>
					<svelte:self schema={propertySchema} />
				</div>
			{/each}
		{/if}
		{#if anyOf}
			<div class="union">
				{#each anyOf as unionSchema}
					<svelte:self schema={unionSchema} />
				{/each}
			</div>
		{/if}
	{/if}
</div>

<style>
	.schema_info {
		background-color: var(--fg_1);
		border-radius: var(--border_radius_sm);
		flex: 1;
		padding: var(--spacing_xs4);
	}
	.title {
		display: flex;
		align-items: center;
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
	.description {
		padding: var(--spacing_md);
	}
	.property {
		display: flex;
		align-items: center;
		padding: var(--spacing_xs4);
	}
	.property .name {
		display: flex;
		width: 180px;
	}
	.required {
		display: flex;
		width: 30px;
	}
	.union {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		flex-wrap: wrap;
		padding: 0 var(--spacing_sm) var(--spacing_sm) var(--spacing_sm);
		gap: var(--spacing_sm);
	}
</style>
