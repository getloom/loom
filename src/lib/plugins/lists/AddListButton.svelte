<script lang="ts">
	import {to_dialog_params} from '@fuz.dev/fuz/dialog.js';

	import {getApp} from '$lib/ui/app';
	import {getSpaceContext} from '$lib/vocab/view/view';
	import CreateEntityForm from '$lib/ui/CreateEntityForm.svelte';
	import type {EntityId} from '$lib/vocab/entity/entity';

	const {actor, space, hub} = getSpaceContext();

	const {actions} = getApp();

	export let source_id: EntityId | undefined = undefined;

	// TODO could be made more generic as a `CreateEntityButton` and take options for everything
</script>

<button
	on:click={() =>
		actions.OpenDialog(
			to_dialog_params(CreateEntityForm, {
				done: () => actions.CloseDialog(),
				entityName: 'list',
				actor,
				hub,
				space,
				type: 'OrderedCollection',
				ties: source_id ? [{source_id}] : undefined,
				fields: {content: true},
			}),
		)}
>
	add list
</button>
