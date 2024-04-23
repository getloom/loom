<script lang="ts">
	import {to_dialog_params} from '@ryanatkn/fuz/dialog.js';

	import About from '$lib/ui/About.svelte';
	import {getApp} from '$lib/ui/app.js';

	const {actions} = getApp();
</script>

<button
	type="button"
	class="plain icon_button"
	on:click={() => actions.OpenDialog(to_dialog_params(About, {}))}
>
	?
</button>
