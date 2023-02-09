<script lang="ts">
	import Message from '@feltjs/felt-ui/Message.svelte';
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Role} from '$lib/vocab/role/role';

	export let role: Readable<Role>;
	export let defaultRoleId: number;
	export let selectedRole: Readable<Role> | null;
	export let selectRole: (role: Readable<Role>) => void;

	$: selected = selectedRole ? selectedRole === role : false;
	$: defaultRole = $role.role_id === defaultRoleId;
	$: bulletIcon = defaultRole ? '⭐' : '-';

	let errorMessage: string | undefined;
</script>

<li>
	<button on:click={() => selectRole(role)} class="row selectable" class:selected>
		{bulletIcon}
		{$role.name}
		{#if errorMessage}
			<Message status="error">{errorMessage}</Message>
		{/if}
	</button>
</li>

<style>
	.row {
		font-size: var(--font_size_xl);
		justify-content: space-between;
		padding-top: var(--spacing_sm);
	}
</style>
