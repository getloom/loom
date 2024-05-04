<script lang="ts">
	import type {Readable} from '@getloom/svelte-gettable-stores';

	import type {Space} from '$lib/vocab/space/space.js';
	import type {Hub} from '$lib/vocab/hub/hub.js';
	import type {AccountActor} from '$lib/vocab/actor/actor.js';
	import {setSpaceContext} from '$lib/vocab/view/view.js';
	import {getApp} from '$lib/ui/app.js';
	import type {Directory} from '$lib/vocab/entity/entityData.js';

	/**
	 * `SpaceContext` sets a non-reactive object (`spaceContext`) in the Svelte component context
	 * and makes `let:spaceContext` available to the slot.
	 * When this component's props change,
	 * the `spaceContext` object is mutated to sync those references.
	 * The slot is keyed by the uniqueness of the context object to support non-reactivity.
	 */

	const {
		ui: {entityById},
	} = getApp();

	export let actor: Readable<AccountActor>;
	export let hub: Readable<Hub>;
	export let space: Readable<Space>;

	const spaceContext = {
		actor,
		hub,
		space,
		directory: entityById.get($space.directory_id) as Readable<Directory>,
	};
	setSpaceContext(spaceContext);

	let count = 0;

	$: if (spaceContext.actor !== actor) {
		spaceContext.actor = actor;
		count++;
	}
	$: if (spaceContext.hub !== hub) {
		spaceContext.hub = hub;
		count++;
	}
	$: if (spaceContext.space !== space) {
		spaceContext.space = space;
		spaceContext.directory = entityById.get($space.directory_id) as Readable<Directory>;
		count++;
	}
</script>

<!-- This `#key` causes all views to be recreated
	every time a property of the mutable SpaceContext changes. -->
{#key count}
	<slot {spaceContext} />
{/key}
