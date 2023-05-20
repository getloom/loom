<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {toContextmenuParams} from '@feltjs/felt-ui';

	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import {getApp} from '$lib/ui/app';
	import type {ClientActor} from '$lib/vocab/actor/actor';
	import ActorContextmenu from '$lib/app/contextmenu/ActorContextmenu.svelte';

	const {
		ui: {contextmenu},
	} = getApp();

	export let actor: Readable<ClientActor>;
</script>

<li use:contextmenu.action={toContextmenuParams(ActorContextmenu, {actor})}>
	<ActorAvatar {actor} />
</li>

<style>
	li {
		--icon_size: var(--icon_size_sm);
		padding: var(--spacing_xs3) var(--spacing_xs);
	}
</style>
