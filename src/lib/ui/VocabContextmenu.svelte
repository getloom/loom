<script lang="ts">
	import Contextmenu_Entry from '@fuz.dev/fuz_contextmenu/Contextmenu_Entry.svelte';
	import {to_dialog_params} from '@fuz.dev/fuz_dialog/dialog.js';

	import {getApp} from '$lib/ui/app.js';
	import SchemaInfo from '$lib/ui/SchemaInfo.svelte';
	import {schemasByName} from '$lib/vocab/schemas.js';
	import {actionDataByName} from '$lib/vocab/action/actionData.js';
	import ActionInfo from '$lib/ui/ActionInfo.svelte';
	import ViewInfo from '$lib/ui/ViewInfo.svelte';
	import {viewTemplatesByName} from '$lib/vocab/view/view.js';
	import type {VocabName} from '$lib/vocab/vocab.js';

	// TODO this is currently unused because it causes the entire vocab to be loaded with the root payload

	export let name: VocabName;

	const {actions} = getApp();

	$: schema = schemasByName.get(name);
	$: action = actionDataByName.get(name);
	$: view = viewTemplatesByName.get(name);

	const run = (): void => {
		if (schema) {
			actions.OpenDialog(to_dialog_params(SchemaInfo, {schema}));
		} else if (action) {
			actions.OpenDialog(to_dialog_params(ActionInfo, {action}));
		} else if (view) {
			actions.OpenDialog(to_dialog_params(ViewInfo, {view}));
		}
	};
</script>

{#if schema || action || view}
	<Contextmenu_Entry {run}>
		More about <code>{name}</code>
		<svelte:fragment slot="icon">?</svelte:fragment>
	</Contextmenu_Entry>
{/if}
