<script lang="ts">
	import type {ViewTemplate} from '$lib/vocab/view/view';

	export let view: ViewTemplate;
</script>

<div class="view_info">
	<div class="title padded_xs">
		<span style:font-size="var(--size_lg)">
			{view.icon}
			<span class="name">{view.name}</span>
		</span>
		<span class="tags">
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
		margin-bottom: var(--spacing_md);
		font-size: var(--font_size_lg);
	}
	.name {
		font-family: var(--font_family_mono);
	}
	.tags {
		margin-left: var(--spacing_md);
	}
</style>
