<script lang="ts">
	import {getSpaceContext} from '$lib/vocab/view/view.js';
	import Notes from '$lib/plugins/notes/Notes.svelte';
	import Mention from '$lib/plugins/mention/Mention.svelte';

	const {actor} = getSpaceContext();
</script>

<div class="personal-home">
	<section class="prose padded_1">
		<h1 style:--mention_icon_size="var(--icon_size_md)">
			<Mention name={$actor.name} />'s personal hub
		</h1>
	</section>
	<Notes />
</div>
