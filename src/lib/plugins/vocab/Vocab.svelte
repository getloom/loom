<script lang="ts">
	import {base} from '$app/paths';
	import {toContextmenuParams} from '@feltjs/felt-ui/contextmenu.js';

	import VocabContextmenu from '$lib/ui/VocabContextmenu.svelte';
	import {getApp} from '$lib/ui/app';

	// Like a `Mention` but for the Felt vocabulary.

	const {
		ui: {contextmenu},
	} = getApp();

	/**
	 * The vocabulary item name. Currently supports models and actions.
	 */
	export let name: string;

	/**
	 * Optionally specify if the link should be displayed as selected,
	 * like if the hash fragment matches.
	 */
	export let selected = false;

	/**
	 * Optionally specify if the text should be wrapped in a `<code>` element.
	 */
	export let plain = false;
</script>

<a
	href="{base}/docs/vocab#{name}"
	class:selected
	use:contextmenu.action={toContextmenuParams(VocabContextmenu, {name})}
	>{#if plain}<slot>{name}</slot>{:else}<code><slot>{name}</slot></code>{/if}</a
>
