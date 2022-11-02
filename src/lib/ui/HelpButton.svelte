<script lang="ts">
	import About from '$lib/ui/About.svelte';
	import {getApp} from '$lib/ui/app';

	const {dispatch} = getApp();
</script>

<button
	type="button"
	class="plain-button icon-button"
	on:click={() => dispatch.OpenDialog({Component: About})}
>
	?
</button>
