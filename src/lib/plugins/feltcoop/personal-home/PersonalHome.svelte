<script lang="ts">
	import {getViewContext} from '$lib/vocab/view/view';
	import Notes from '$lib/plugins/feltcoop/notes/Notes.svelte';
	import Mention from '$lib/plugins/feltcoop/mention/Mention.svelte';

	const viewContext = getViewContext();
	$: ({persona} = $viewContext);
</script>

<div class="personal-home">
	<section class="markup padded-xl">
		<h1 style:--mention_icon_size="var(--icon_size_md)">
			<Mention name={$persona.name} />'s personal hub
		</h1>
	</section>
	<Notes />
</div>
