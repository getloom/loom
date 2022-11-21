<script lang="ts">
	import PersonaExplorer from '$lib/ui/PersonaExplorer.svelte';
	import CommunityExplorer from '$lib/ui/CommunityExplorer.svelte';
</script>

<div class="markup padded-xl">
	<h1>instance admin</h1>
	<CommunityExplorer />
	<PersonaExplorer />
</div>

<style>
	.markup {
		min-height: 100%;
	}
</style>
