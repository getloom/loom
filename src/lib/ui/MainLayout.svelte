<script lang="ts">
	import {getApp} from '$lib/ui/app';
	import SvastText from '$lib/ui/SvastText.svelte';
	import LayoutContextProvider from '$lib/ui/LayoutContextProvider.svelte';

	const {
		ui: {mainLayoutView, personaSelection, hubSelection, spaceSelection},
	} = getApp();

	$: persona = $personaSelection;
	$: hub = $hubSelection;
	$: space = $spaceSelection;
</script>

<LayoutContextProvider {persona} {hub} {space}>
	<SvastText text={$mainLayoutView} />
</LayoutContextProvider>
