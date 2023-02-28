<script lang="ts">
	import {getApp} from '$lib/ui/app';
	import SvastText from '$lib/ui/SvastText.svelte';
	import ViewContext from '$lib/ui/ViewContext.svelte';

	const {
		ui: {mainLayoutView, personaSelection, hubSelection, spaceSelection},
	} = getApp();

	// TODO what can we do about this type? making the `viewContext` values nullable causes a ton of type errors
	$: persona = $personaSelection!;
	$: hub = $hubSelection!;
	$: space = $spaceSelection!;
</script>

<ViewContext {persona} {hub} {space}>
	<SvastText text={$mainLayoutView} />
</ViewContext>
