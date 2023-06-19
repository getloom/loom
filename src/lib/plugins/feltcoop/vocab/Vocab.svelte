<script lang="ts">
	import {base} from '$app/paths';
	import {toContextmenuParams} from '@feltjs/felt-ui/contextmenu.js';

	import VocabContextmenu from '$lib/app/contextmenu/VocabContextmenu.svelte';
	import {getApp} from '$lib/ui/app';

	// Like a `Mention` but for the Felt vocabulary.

	const {
		ui: {contextmenu},
	} = getApp();

	export let name: string;
</script>

<a use:contextmenu.action={toContextmenuParams(VocabContextmenu, {name})} href="{base}/docs#{name}"
	><code><slot>{name}</slot></code></a
>
