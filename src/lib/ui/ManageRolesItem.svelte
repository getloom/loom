<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {slide} from 'svelte/transition';

	import type {Role, RoleId} from '$lib/vocab/role/role';

	export let role: Readable<Role>;
	export let defaultRoleId: RoleId;
	export let selected: boolean;
	export let selectRole: (role: Readable<Role>) => void;

	$: defaultRole = $role.role_id === defaultRoleId;
</script>

<li in:slide>
	<button type="button" on:click={() => selectRole(role)} class="selectable" class:selected>
		{$role.name}
		{#if defaultRole}<span title="this is the default role">⭐</span>{/if}
	</button>
</li>

<style>
	button {
		width: 100%;
		margin-bottom: var(--spacing_xs);
		justify-content: space-between;
	}
</style>
