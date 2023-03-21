<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import PersonaAvatar from '$lib/ui/PersonaAvatar.svelte';
	import {getApp} from '$lib/ui/app';
	import type {ClientPersona} from '$lib/vocab/actor/persona';
	import PersonaContextmenu from '$lib/app/contextmenu/PersonaContextmenu.svelte';

	const {
		ui: {contextmenu},
	} = getApp();

	export let persona: Readable<ClientPersona>;
</script>

<li use:contextmenu.action={[[PersonaContextmenu, {persona}]]}>
	<PersonaAvatar {persona} />
</li>

<style>
	li {
		--icon_size: var(--icon_size_sm);
		padding: var(--spacing_xs3) var(--spacing_xs);
	}
</style>
