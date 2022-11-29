<script lang="ts">
	import {getApp} from '$lib/ui/app';
	import {getViewContext} from '$lib/vocab/view/view';
	import EntityInput from '$lib/ui/EntityInput.svelte';

	const viewContext = getViewContext();
	$: ({persona, space, community} = $viewContext);

	const {dispatch} = getApp();
</script>

<button
	on:click={() =>
		dispatch.OpenDialog({
			Component: EntityInput,
			props: {
				done: () => dispatch.CloseDialog(),
				entityName: 'Todo',
				persona,
				community,
				space,
				fields: {name: true},
			},
		})}>add list</button
>
