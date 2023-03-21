<script lang="ts">
	import {writable, type Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Space} from '$lib/vocab/space/space';
	import type {Hub} from '$lib/vocab/hub/hub';
	import type {AccountPersona} from '$lib/vocab/actor/persona';
	import {setLayoutContext} from '$lib/ui/layout';
	import {getApp} from '$lib/ui/app';

	/**
	 * `LayoutContextProvider` sets `layoutContext` in the Svelte component context,
	 * keeps it updated when the store references change,
	 * and makes `let:layoutContext` available to the slot.
	 */

	const {
		ui: {entityById},
	} = getApp();

	export let persona: Readable<AccountPersona> | null;
	export let hub: Readable<Hub> | null;
	export let space: Readable<Space> | null;

	const layoutContext = writable({
		persona,
		hub,
		space,
		directory: $space ? entityById.get($space.directory_id)! : null,
	});
	setLayoutContext(layoutContext);
	// check to make sure we don't set twice on init
	$: if (
		$layoutContext.persona !== persona ||
		$layoutContext.hub !== hub ||
		$layoutContext.space !== space
	) {
		$layoutContext = {
			persona,
			hub,
			space,
			directory: $space ? entityById.get($space.directory_id)! : null,
		};
	}
</script>

<slot {layoutContext} />
