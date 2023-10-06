<script lang="ts">
	import {writable, type Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Space} from '$lib/vocab/space/space.js';
	import type {Hub} from '$lib/vocab/hub/hub.js';
	import type {AccountActor} from '$lib/vocab/actor/actor.js';
	import {setLayoutContext} from '$lib/ui/layout.js';
	import {getApp} from '$lib/ui/app.js';

	/**
	 * `LayoutContextProvider` sets `layoutContext` in the Svelte component context,
	 * keeps it updated when the store references change,
	 * and makes `let:layoutContext` available to the slot.
	 */

	const {
		ui: {entityById},
	} = getApp();

	export let actor: Readable<AccountActor> | null;
	export let hub: Readable<Hub> | null;
	export let space: Readable<Space> | null;

	const layoutContext = writable({
		actor,
		hub,
		space,
		directory: $space ? entityById.get($space.directory_id)! : null,
	});
	setLayoutContext(layoutContext);
	// check to make sure we don't set twice on init
	$: if (
		$layoutContext.actor !== actor ||
		$layoutContext.hub !== hub ||
		$layoutContext.space !== space
	) {
		$layoutContext = {
			actor,
			hub,
			space,
			directory: $space ? entityById.get($space.directory_id)! : null,
		};
	}
</script>

<slot {layoutContext} />
