<script lang="ts">
	import {base} from '$app/paths';
	import {toContextmenuParams} from '@feltjs/felt-ui/contextmenu.js';
	import type {Mutable} from '@feltcoop/svelte-gettable-stores';

	import VocabContextmenu from '$lib/ui/VocabContextmenu.svelte';
	import {getApp} from '$lib/ui/app';
	import {getDocsSettings} from '$lib/docs/docs';

	const docsSettings = getDocsSettings();
	$: path = $docsSettings?.path || '/docs';

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
	export let selected: boolean | undefined = undefined;

	/**
	 * Optionally specify if the link should be displayed as selected via a set of matching names.
	 */
	export let selections: Mutable<Set<string>> | undefined = undefined;

	/**
	 * Optionally specify if the text should be wrapped in a `<code>` element.
	 */
	export let plain = false;

	$: finalSelected = selected ?? $selections?.value.has(name);
</script>

<a
	href="{base}{path}/vocab#{name}"
	class:selected={finalSelected}
	use:contextmenu.action={toContextmenuParams(VocabContextmenu, {name})}
	>{#if plain}<slot>{name}</slot>{:else}<code><slot>{name}</slot></code>{/if}</a
>
