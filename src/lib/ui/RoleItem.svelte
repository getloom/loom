<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Role} from '$lib/vocab/role/role';
	import AssignmentDisplayItem from '$lib/ui/AssignmentDisplayItem.svelte';
	import type {Assignment} from '$lib/vocab/assignment/assignment';

	export let role: Readable<Role>;
	export let assignmentsByRoleId: Readable<Map<number, Assignment[]>>;

	$: assignments = $assignmentsByRoleId.get($role.role_id)!;
</script>

<li class="centered-hz">
	<span class="role-name panel">{$role.name}</span>
	<ul class="role-members">
		{#each assignments as assignment (assignment)}
			<li><AssignmentDisplayItem {assignment} /></li>
		{:else}
			no assignments
		{/each}
	</ul>
</li>

<style>
	/* TODO extract some sort of reusable class/component */
	.role-name {
		font-size: var(--font_size_xl);
		font-weight: 600;
		padding: var(--spacing_xs2) var(--spacing_sm);
		margin-right: var(--spacing_md);
	}
	.role-members {
		font-size: medium;
		display: flex;
		flex-direction: row;
		flex: 1;
		flex-wrap: wrap;
	}
	.role-members li {
		margin-right: var(--spacing_md);
	}
</style>
