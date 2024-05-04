<script lang="ts">
	import {base} from '$app/paths';
	import type {Mutable} from '@getloom/svelte-gettable-stores';

	import {getDocsSettings} from '$lib/docs/docs.js';
	import type {VocabName} from '$lib/vocab/vocab.js';

	const docsSettings = getDocsSettings();
	$: path = $docsSettings?.path || '/docs';

	// Like a `Mention` but for the Felt vocabulary.

	/**
	 * The vocabulary item name. Currently supports models and actions.
	 */
	export let name: VocabName;

	/**
	 * Optionally specify if the link should be displayed as selected,
	 * like if the hash fragment matches.
	 */
	export let selected: boolean | undefined = undefined;

	/**
	 * Optionally specify if the link should be displayed as selected via a set of matching names.
	 */
	export let selections: Mutable<Set<VocabName>> | undefined = undefined;

	/**
	 * Optionally specify if the text should be wrapped in a `<code>` element.
	 */
	export let plain = false;

	$: finalSelected = selected ?? $selections?.value.has(name);
</script>

<!-- TODO contextmenu is currently disabled because `VocabContextmenu` loads the entire vocab for the root payload
	use:contextmenu.action={to_contextmenu_params(VocabContextmenu, {name})}
-->
<a href="{base}{path}/vocab#{name}" class:selected={finalSelected}
	>{#if plain}<slot>{name}</slot>{:else}<code><slot>{name}</slot></code>{/if}</a
>
