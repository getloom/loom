<script lang="ts">
	import RolesList from '$lib/ui/RolesList.svelte';
</script>

<div class="padded_xl">
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
</div>

<style>
	section {
		margin-bottom: var(--spacing_xl7);
	}
</style>
