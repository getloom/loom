<script lang="ts">
	import {toDialogParams} from '@feltjs/felt-ui/dialog.js';

	import About from '$lib/ui/About.svelte';
	import {getApp} from '$lib/ui/app';

	const {actions} = getApp();
</script>

<button
	type="button"
	class="plain icon_button"
	on:click={() => actions.OpenDialog(toDialogParams(About, {}))}
>
	?
</button>
