<script lang="ts">
	import {getApp} from '$lib/ui/app';
	import type {Community} from '$lib/vocab/community/community';
	import Avatar from '$lib/ui/Avatar.svelte';
	import {getViewContext} from '$lib/vocab/view/view';
	import RolesList from '$lib/ui/RolesList.svelte';
	import Todo from '$lib/ui/view/Todo.svelte';

	const {dispatch} = getApp();

	const viewContext = getViewContext();
	$: ({persona} = $viewContext);

	// TODO this is just stubbing out some admin-like UI
	let communities: Community[] | undefined;
	const loadAllCommunities = async () => {
		// TODO need to cache this data in the `ui` somehow -- see comment below
		const result = await dispatch.ReadCommunities({actor: $persona.persona_id});
		if (!result.ok) throw Error(); // TODO querying helpers
		communities = result.value.communities;
	};
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
		<h2>communities</h2>
		{#if communities}
			<ul>
				{#each communities as community}
					<!-- TODO `CommunityAvatar` expects a store that's registered with the system for the contextmenu,
        and we probably want that as well, right? So how can we cache the data? See above. -->
					<Avatar name={community.name} type="Community" hue={community.settings.hue} />
				{/each}
			</ul>
		{:else}
			<!-- TODO pending status with query state -->
			<button on:click={loadAllCommunities}>load all communities</button>
		{/if}
	</section>
</div>

<style>
	section {
		margin-bottom: var(--spacing_xl7);
	}
</style>
