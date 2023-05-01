<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Space} from '$lib/vocab/space/space';
	import type {Hub} from '$lib/vocab/hub/hub';
	import type {AccountActor} from '$lib/vocab/actor/actor';
	import {getApp} from '$lib/ui/app';
	import SvastText from '$lib/ui/SvastText.svelte';
	import SpaceContextProvider from '$lib/ui/SpaceContextProvider.svelte';

	const {
		actions,
		ui: {viewBySpace},
	} = getApp();

	export let actor: Readable<AccountActor>;
	export let hub: Readable<Hub>;
	export let space: Readable<Space>;

	$: ({directory_id} = $space);
	//TODO we might want to just roll the logic from this action into the SelectSpace mutation
	$: actions.ClearFreshness({directory_id});

	$: viewText = $viewBySpace.value.get(space) || $space.view;
</script>

<SpaceContextProvider {actor} {hub} {space}>
	<SvastText text={viewText} />
</SpaceContextProvider>
