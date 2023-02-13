<script lang="ts">
	import {writable, type Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Space} from '$lib/vocab/space/space';
	import type {Community} from '$lib/vocab/community/community';
	import type {AccountPersona} from '$lib/vocab/persona/persona';
	import {setViewContext} from '$lib/vocab/view/view';

	/**
	 * `ViewContext` sets `viewContext` in the Svelte component context,
	 * keeps it updated when the store references change,
	 * and makes `let:viewContext` available to the slot.
	 */

	export let persona: Readable<AccountPersona>;
	export let community: Readable<Community>;
	export let space: Readable<Space>;

	const viewContext = writable({persona, community, space});
	setViewContext(viewContext);
	// check to make sure we don't set twice on init
	$: if (
		$viewContext.persona !== persona ||
		$viewContext.community !== community ||
		$viewContext.space !== space
	) {
		$viewContext = {persona, community, space};
	}
</script>

<slot {viewContext} />
