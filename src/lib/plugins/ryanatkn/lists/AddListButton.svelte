<script lang="ts">
	import {getApp} from '$lib/ui/app';
	import {getViewContext} from '$lib/vocab/view/view';
	import CreateEntityForm from '$lib/ui/CreateEntityForm.svelte';

	const viewContext = getViewContext();
	$: ({persona, space, hub} = $viewContext);

	const {dispatch} = getApp();

	// TODO could be made more generic as a `CreateEntityButton` and take options for everything
</script>

<button
	on:click={() =>
		dispatch.OpenDialog({
			Component: CreateEntityForm,
			props: {
				done: () => dispatch.CloseDialog(),
				entityName: 'list',
				persona,
				hub,
				space,
				fields: {content: true},
			},
		})}>add list</button
>
