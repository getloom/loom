<script lang="ts">
	import {getApp} from '$lib/ui/app';
	import SvastText from '$lib/ui/SvastText.svelte';
	import LayoutContextProvider from '$lib/ui/LayoutContextProvider.svelte';

	const {
		ui: {mainLayoutView, actorSelection, hubSelection, spaceSelection},
	} = getApp();

	$: persona = $actorSelection;
	$: hub = $hubSelection;
	$: space = $spaceSelection;
</script>

<LayoutContextProvider actor={persona} {hub} {space}>
	<SvastText text={$mainLayoutView} />
</LayoutContextProvider>
