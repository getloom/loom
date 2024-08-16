<script lang="ts">
	import RolesList from '$lib/ui/RolesList.svelte';
	import {getSpaceContext} from '$lib/vocab/view/view';

	const {hub} = getSpaceContext();

	$: instanceSettings = $hub.settings.instance;
</script>

<div class="padded_1">
	<section>
		<div class="prose">
			<h1>admin</h1>
		</div>
	</section>
	<section>
		<div class="prose">
			<h2>roles</h2>
		</div>
		<RolesList />
	</section>
	{#if instanceSettings?.enableInviteOnlySignups}
		<section>
			<div class="prose">
				<h2>create invite link</h2>
			</div>
			TODO LOL
		</section>
	{/if}
</div>

<style>
	section {
		margin-bottom: var(--spacing_7);
	}
</style>
