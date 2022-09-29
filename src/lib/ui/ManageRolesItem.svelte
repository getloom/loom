<script lang="ts">
	import Message from '@feltcoop/felt/ui/Message.svelte';
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Role} from '$lib/vocab/role/role';

	export let role: Readable<Role>;

	let errorMessage: string | undefined;
</script>

<li>
	<div class="row">
		- {$role.name}
		{#if errorMessage}
			<Message status="error">{errorMessage}</Message>
		{/if}
	</div>
</li>

<style>
	.row {
		font-size: var(--font_size_xl);
		justify-content: space-between;
		padding-top: var(--spacing_sm);
	}
</style>
