<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Role} from '$lib/vocab/role/role';
	import AssignmentItem from '$lib/ui/AssignmentItem.svelte';
	import type {Assignment} from '$lib/vocab/assignment/assignment';

	export let role: Readable<Role>;
	export let assignmentsByRoleId: Readable<Map<number, Array<Readable<Assignment>>>>;

	$: assignments = $assignmentsByRoleId.get($role.role_id)!;
</script>

<li>
	<span class="role-name">{$role.name}:</span>
	<ul class="role-members">
		{#each assignments as assignment (assignment)}
			<li><AssignmentItem {assignment} /></li>
		{:else}
			no assignments
		{/each}
	</ul>
</li>

<style>
	.role-name {
		font-size: larger;
		text-decoration: underline;
		font-weight: 600;
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
