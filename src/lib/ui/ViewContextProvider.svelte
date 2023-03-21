<script lang="ts">
	import {writable, type Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Space} from '$lib/vocab/space/space';
	import type {Hub} from '$lib/vocab/hub/hub';
	import type {AccountPersona} from '$lib/vocab/actor/persona';
	import {setViewContext} from '$lib/vocab/view/view';
	import {getApp} from '$lib/ui/app';

	/**
	 * `ViewContext` sets `viewContext` in the Svelte component context,
	 * keeps it updated when the store references change,
	 * and makes `let:viewContext` available to the slot.
	 */

	const {
		ui: {entityById},
	} = getApp();

	export let persona: Readable<AccountPersona>;
	export let hub: Readable<Hub>;
	export let space: Readable<Space>;

	const viewContext = writable({
		persona,
		hub,
		space,
		directory: entityById.get($space.directory_id)!,
	});
	setViewContext(viewContext);
	// check to make sure we don't set twice on init
	$: if (
		$viewContext.persona !== persona ||
		$viewContext.hub !== hub ||
		$viewContext.space !== space
	) {
		$viewContext = {persona, hub, space, directory: entityById.get($space.directory_id)!};
	}
</script>

<slot {viewContext} />
