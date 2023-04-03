<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import type {Space} from '$lib/vocab/space/space';
	import SpaceIcon from '$lib/ui/SpaceIcon.svelte';

	export let space: Readable<Space>;
</script>

<!-- TODO better API to set icon font size? -->
<SpaceIcon {space} style="font-size: var(--font_size_lg)" />
<span>{$space.name} </span>

<style>
	span {
		padding: var(--spacing_xs);
	}
</style>
