<script lang="ts">
	export let done: (() => void) | undefined = undefined;
	export let action: (() => void) | undefined = undefined;
	export let description: string;

	function actToClose() {
		action?.();
		done?.();
	}
</script>

<div class="markup padded-xl">
	<h1>Are you sure you want to {description}?</h1>
	<button on:click={() => actToClose()}>Yes</button>
	<button on:click={() => done?.()}>No</button>
</div>
