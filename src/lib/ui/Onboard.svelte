<script lang="ts">
	import CreateAccountActorForm from '$lib/ui/CreateAccountActorForm.svelte';
</script>

<div class="prose">
	<div class="welcome">@</div>
	<CreateAccountActorForm />
</div>

<style>
	.welcome {
		font-size: var(--size_7);
		text-align: center;
		font-weight: 900;
	}
</style>
