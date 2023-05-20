<script lang="ts">
	import {toDialogData} from '@feltjs/felt-ui';

	import About from '$lib/ui/About.svelte';
	import {getApp} from '$lib/ui/app';

	const {actions} = getApp();
</script>

<button
	type="button"
	class="plain-button icon-button"
	on:click={() => actions.OpenDialog(toDialogData(About, {}))}
>
	?
</button>
