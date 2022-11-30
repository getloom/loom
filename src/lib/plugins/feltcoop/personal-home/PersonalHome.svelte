<script lang="ts">
	import {getViewContext} from '$lib/vocab/view/view';
	import Notes from '$lib/plugins/feltcoop/notes/Notes.svelte';
	import PersonaMention from '$lib/ui/PersonaMention.svelte';

	const viewContext = getViewContext();
	$: ({persona} = $viewContext);
</script>

<div class="personal-home">
	<section class="markup padded-xl">
		<h1><PersonaMention name={$persona.name} />'s personal workspace</h1>
	</section>
	<Notes />
</div>
