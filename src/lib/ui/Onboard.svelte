<script lang="ts">
	import CreateAccountPersonaForm from '$lib/ui/CreateAccountPersonaForm.svelte';
</script>

<div class="markup">
	<div class="welcome">@</div>
	<CreateAccountPersonaForm />
</div>

<style>
	.welcome {
		font-size: var(--font_size_xl7);
		text-align: center;
		font-weight: 900;
	}
</style>
