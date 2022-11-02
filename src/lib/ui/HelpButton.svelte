<script lang="ts">
	import About from '$lib/ui/About.svelte';
	import {getApp} from '$lib/ui/app';

	const {dispatch} = getApp();
</script>

<button class="plain-button" on:click={() => dispatch.OpenDialog({Component: About})}>
	<div class="icon">?</div>
</button>
