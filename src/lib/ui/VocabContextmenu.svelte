<script lang="ts">
	import ContextmenuEntry from '@feltjs/felt-ui/ContextmenuEntry.svelte';
	import {toDialogParams} from '@feltjs/felt-ui/dialog.js';

	import {getApp} from '$lib/ui/app';
	import SchemaInfo from '$lib/ui/SchemaInfo.svelte';
	import {schemasByName} from '$lib/vocab/schemas';
	import {actionDataByName} from '$lib/vocab/action/actionData';
	import ActionInfo from '$lib/ui/ActionInfo.svelte';

	export let name: string;

	const {actions} = getApp();

	$: schema = schemasByName.get(name);
	$: action = actionDataByName.get(name);

	const run = (): void => {
		if (schema) {
			actions.OpenDialog(toDialogParams(SchemaInfo, {schema}));
		} else if (action) {
			actions.OpenDialog(toDialogParams(ActionInfo, {action}));
		}
	};
</script>

{#if schema || action}
	<ContextmenuEntry {run}>
		More about <code>{name}</code>
		<svelte:fragment slot="icon">?</svelte:fragment>
	</ContextmenuEntry>
{/if}
