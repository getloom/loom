<script lang="ts">
	import type {ActionData} from '$lib/vocab/action/action';

	export let action: ActionData;
</script>

<li id={action.name}>
	<div class="title">
		<code class="name">{action.name}</code>
		<small class="type">{action.type}</small>
	</div>
	{#if action.type !== 'ClientAction'}
		<div class="property">
			<span>path</span>
			<span>{action.route.method}</span>
			<span>{action.route.path}</span>
		</div>
	{/if}
	<div class="property">
		<span>params</span>
		<!-- TODO display the generated type string instead of the schema,
    probably by generating a sibling file to `actions.ts` like `eventTypeStrings.ts` -->
		<pre>{JSON.stringify(action.params, null, 2)}</pre>
	</div>
	{#if action.type !== 'ClientAction'}
		<div class="property">
			<span>response</span>
			<!-- TODO display the generated type string instead of the schema,
      probably by generating a sibling file to `actions.ts` like `eventTypeStrings.ts` -->
			<pre>{JSON.stringify(action.response, null, 2)}</pre>
		</div>
	{/if}
	<div class="property">
		<span>returns</span>
		<pre>{action.returns}</pre>
	</div>
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
	.name {
		font-size: var(--size_lg);
		padding: var(--spacing_md);
		border-bottom-left-radius: 0;
		border-bottom-right-radius: 0;
	}
	.type {
		padding: var(--spacing_lg);
		background: none;
		font-family: var(--font_family_mono);
	}
	.property {
		display: flex;
		align-items: center;
		padding: var(--spacing_md) var(--spacing_md) var(--spacing_md) var(--spacing_xl4);
		background-color: var(--fg_1);
		overflow: auto;
	}
	.property:nth-child(2n + 1) {
		background-color: var(--fg_0);
	}
	.property > span {
		display: flex;
		width: 100px;
	}
</style>
