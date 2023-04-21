<script lang="ts">
	import {getApp} from '$lib/ui/app';
	import {getViewContext} from '$lib/vocab/view/view';
	import CreateEntityForm from '$lib/ui/CreateEntityForm.svelte';

	const viewContext = getViewContext();
	$: ({actor, space, hub} = $viewContext);

	const {actions} = getApp();

	// TODO could be made more generic as a `CreateEntityButton` and take options for everything
</script>

<button
	on:click={() =>
		actions.OpenDialog({
			Component: CreateEntityForm,
			props: {
				done: () => actions.CloseDialog(),
				entityName: 'list',
				actor,
				hub,
				space,
				fields: {content: true},
			},
		})}>add list</button
>
