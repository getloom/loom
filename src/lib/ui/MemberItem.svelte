<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {to_contextmenu_params} from '@fuz.dev/fuz_contextmenu/contextmenu.js';

	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import {getApp} from '$lib/ui/app.js';
	import type {ClientActor} from '$lib/vocab/actor/actor.js';
	import ActorContextmenu from '$lib/ui/ActorContextmenu.svelte';

	const {
		ui: {contextmenu},
	} = getApp();

	export let actor: Readable<ClientActor>;
</script>

<li use:contextmenu.action={to_contextmenu_params(ActorContextmenu, {actor})}>
	<ActorAvatar {actor} />
</li>

<style>
	li {
		--icon_size: var(--icon_size_sm);
		padding: var(--spacing_xs3) var(--spacing_xs);
	}
</style>
