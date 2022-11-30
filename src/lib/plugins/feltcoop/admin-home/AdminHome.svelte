<script lang="ts">
	import RolesList from '$lib/ui/RolesList.svelte';
	import Todo from '$lib/plugins/feltcoop/todo/Todo.svelte';
	import PersonaExplorer from '$lib/ui/PersonaExplorer.svelte';
	import CommunityExplorer from '$lib/ui/CommunityExplorer.svelte';
</script>

<div class="padded-xl">
	<section>
		<div class="markup">
			<h1>admin</h1>
		</div>
	</section>
	<section>
		<div class="markup">
			<h2>roles</h2>
		</div>
		<RolesList />
	</section>
	<section>
		<div class="markup">
			<h2>todo</h2>
		</div>
		<Todo />
	</section>
	<section>
		<CommunityExplorer />
	</section>
	<section>
		<PersonaExplorer />
	</section>
</div>

<style>
	section {
		margin-bottom: var(--spacing_xl7);
	}
</style>
