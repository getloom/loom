<script lang="ts">
	import type {ViewTemplate} from '$lib/vocab/view/view';

	export let view: ViewTemplate;
</script>

<li class="view-template" id={view.name}>
	<div class="title padded_xs">
		<span style:font-size="var(--size_lg)">
			{view.icon}
			{view.name}
		</span>
		<span>
			{#if view.creatable !== false}
				<span class="chip" title="users can create this view in normal circumstances"
					>creatable</span
				>
			{/if}
			{#if view.admin}
				<span class="chip" title="requires instance admin permissions">admin</span>
			{/if}
		</span>
	</div>
	<code class="padded_xs">{view.view}</code>
</li>

<style>
	li {
		display: flex;
		flex-direction: column;
		padding: var(--spacing_xl3) 0;
	}
	.title {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
</style>
