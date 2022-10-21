<script lang="ts">
	import SignInForm from '$lib/ui/SignInForm.svelte';
	import SignOutForm from '$lib/ui/SignOutForm.svelte';

	export let guest: boolean;
</script>

{#if guest}
	<SignInForm />
{:else}
	<SignOutForm />
{/if}
