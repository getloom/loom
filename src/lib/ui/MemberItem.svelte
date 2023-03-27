<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import {getApp} from '$lib/ui/app';
	import type {ClientPersona} from '$lib/vocab/actor/persona';
	import ActorContextmenu from '$lib/app/contextmenu/ActorContextmenu.svelte';

	const {
		ui: {contextmenu},
	} = getApp();

	export let persona: Readable<ClientPersona>;
</script>

<li use:contextmenu.action={[[ActorContextmenu, {persona}]]}>
	<ActorAvatar {persona} />
</li>

<style>
	li {
		--icon_size: var(--icon_size_sm);
		padding: var(--spacing_xs3) var(--spacing_xs);
	}
</style>
