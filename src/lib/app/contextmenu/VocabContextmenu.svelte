<script lang="ts">
	import ContextmenuEntry from '@feltjs/felt-ui/ContextmenuEntry.svelte';
	import {toDialogParams} from '@feltjs/felt-ui/dialog.js';
	import {parseSchemaName} from '@feltjs/gro/dist/utils/schema.js';

	import {getApp} from '$lib/ui/app';
	import SchemaInfo from '$lib/ui/SchemaInfo.svelte';
	import {modelSchemas} from '$lib/vocab/schemas';

	export let name: string;

	const {actions} = getApp();

	// TODO cache a map by name
	$: schema = modelSchemas.find((s) => parseSchemaName(s.$id) === name);
</script>

{#if schema}
	<ContextmenuEntry run={() => schema && actions.OpenDialog(toDialogParams(SchemaInfo, {schema}))}>
		More about <code>{name}</code>
		<svelte:fragment slot="icon">?</svelte:fragment>
	</ContextmenuEntry>
{/if}
