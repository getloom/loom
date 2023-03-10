<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Space} from '$lib/vocab/space/space';
	import type {Hub} from '$lib/vocab/hub/hub';
	import type {AccountPersona} from '$lib/vocab/persona/persona';
	import {getApp} from '$lib/ui/app';
	import SvastText from '$lib/ui/SvastText.svelte';
	import ViewContext from '$lib/ui/ViewContext.svelte';

	const {
		dispatch,
		ui: {viewBySpace},
	} = getApp();

	export let persona: Readable<AccountPersona>;
	export let hub: Readable<Hub>;
	export let space: Readable<Space>;

	$: ({directory_id} = $space);
	//TODO we might want to just roll the logic from this event into the SelectSpace mutation
	$: dispatch.ClearFreshness({directory_id});

	$: viewText = $viewBySpace.value.get(space) || $space.view;
</script>

<ViewContext {persona} {hub} {space}>
	<SvastText text={viewText} />
</ViewContext>
