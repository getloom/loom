<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Space} from '$lib/vocab/space/space';
	import type {Community} from '$lib/vocab/community/community';
	import type {AccountPersona} from '$lib/vocab/persona/persona';
	import {getApp} from '$lib/ui/app';
	import SvastText from '$lib/ui/SvastText.svelte';
	import ViewContext from '$lib/ui/ViewContext.svelte';

	const {
		dispatch,
		ui: {viewBySpace},
	} = getApp();

	export let persona: Readable<AccountPersona>;
	export let community: Readable<Community>;
	export let space: Readable<Space>;

	$: directory_id = $space.directory_id;
	//TODO we might want to just roll the logic from this event into the SelectSpace mutation
	$: dispatch.ClearFreshness({directory_id});

	$: viewText = $viewBySpace.value.get(space) || $space.view;
</script>

<ViewContext {persona} {community} {space}>
	<SvastText text={viewText} />
</ViewContext>
