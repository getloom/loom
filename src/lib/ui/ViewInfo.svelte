<script lang="ts">
	import type {ViewTemplate} from '$lib/vocab/view/view';

	export let view: ViewTemplate;
</script>

<div class="view_info">
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
</div>

<style>
	.title {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
</style>
