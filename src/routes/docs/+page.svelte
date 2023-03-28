<script lang="ts">
	import {page} from '$app/stores';

	import SchemaInfo from '$lib/ui/SchemaInfo.svelte';
	import {actionDatas} from '$lib/app/actionData';
	import {vocabSchemas} from '$lib/app/schemas';
	import {viewTemplates} from '$lib/vocab/view/view';

	const title = 'docs';

	$: hash = $page.url.hash.substring(1);

	// TODO use IntersectionObserver to update hash on scroll

	// TODO display plugins
	// TODO display source code links to views and actions and such
</script>

<svelte:head><title>{title}</title></svelte:head>

<div class="wrapper">
	<!-- TODO extract an accessible menu component, see PRS
	https://github.com/feltjs/felt-server/pull/362
	and https://github.com/feltjs/felt-ui/pull/197 -->
	<div class="menu-wrapper markup padded-xl column-sm">
		<menu class="menu">
			<li><h3><a href="#docs" class:selected={hash === 'docs'}>docs</a></h3></li>
			<li><h4><a href="#views" class:selected={hash === 'views'}>views</a></h4></li>
			<menu>
				{#each viewTemplates as viewTemplate (viewTemplate)}
					<li>
						<a href="#{viewTemplate.name}" class:selected={hash === viewTemplate.name}
							>{viewTemplate.name}</a
						>
					</li>
				{/each}
			</menu>
			<li><h4><a href="#vocab" class:selected={hash === 'vocab'}>vocab</a></h4></li>
			<menu>
				{#each vocabSchemas as schema (schema)}
					<li>
						<a href="#{schema.name}" class:selected={hash === schema.name}>{schema.name}</a>
					</li>
				{/each}
			</menu>
			<li><h4><a href="#actions" class:selected={hash === 'actions'}>actions</a></h4></li>
			<menu>
				{#each actionDatas as actionData (actionData.name)}
					<li>
						<a href="#{actionData.name}" class:selected={hash === actionData.name}
							>{actionData.name}</a
						>
					</li>
				{/each}
			</menu>
			<li>
				<h4>
					💚 <a href="https://www.felt.dev">felt.dev</a> ∙
					<a href="https://github.com/feltjs/felt-server">GitHub</a> ∙
					<a href="https://npmjs.com/@feltjs/felt-server">npm</a>
				</h4>
			</li>
		</menu>
	</div>
	<div class="column">
		<div class="markup padded-xl">
			<h1 id="docs">docs</h1>
		</div>
		<div class="markup padded-xl">
			<h2 id="views">views</h2>
		</div>
		<ul>
			{#each viewTemplates as viewTemplate (viewTemplate)}
				<li id={viewTemplate.name}>
					<span class="padded-xs">
						<span style:font-size="var(--font_size_lg)">
							{viewTemplate.icon}
							{viewTemplate.name}
						</span>
						{#if viewTemplate.creatable !== false}
							<span
								class="chip"
								title="users are given the option to create this view in normal circumstances"
								>creatable</span
							>
						{/if}
						{#if viewTemplate.admin}
							<span class="chip" title="requires instance admin permissions to function">admin</span
							>
						{/if}
					</span>
					<code class="padded-xs">{viewTemplate.view}</code>
				</li>
			{/each}
		</ul>
		<div class="markup padded-xl">
			<h2 id="vocab">vocab</h2>
		</div>
		<ul>
			{#each vocabSchemas as schema (schema)}
				<li id={schema.name}>
					<SchemaInfo {schema} />
				</li>
			{/each}
		</ul>
		<div class="markup padded-xl">
			<h2 id="actions">actions</h2>
		</div>
		<ul>
			{#each actionDatas as actionData (actionData.name)}
				<li id={actionData.name}>
					<div class="title">
						<code class="name">{actionData.name}</code>
						<small class="type">{actionData.type}</small>
					</div>
					<div class="property">
						<span>params</span>
						<!-- TODO display the generated type string instead of the schema,
						probably by generating a sibling file to `actions.ts` like `eventTypeStrings.ts` -->
						<pre>{JSON.stringify(actionData.params, null, 2)}</pre>
					</div>
					{#if actionData.type !== 'ClientAction'}
						<div class="property">
							<span>response</span>
							<!-- TODO display the generated type string instead of the schema,
							probably by generating a sibling file to `actions.ts` like `eventTypeStrings.ts` -->
							<pre>{JSON.stringify(actionData.response, null, 2)}</pre>
						</div>
					{/if}
					<div class="property">
						<span>returns</span>
						<pre>{actionData.returns}</pre>
					</div>
				</li>
			{/each}
		</ul>
		<div class="markup padded-xl">
			<menu>
				<li><h3><a href="#docs" class:selected={hash === 'docs'}>docs</a></h3></li>
				<menu>
					<li>
						<h4>
							<a href="#vocab" class:selected={hash === 'vocab'}>vocab</a>
						</h4>
					</li>
					<li>
						<h4>
							<a href="#actions" class:selected={hash === 'actions'}>actions</a>
						</h4>
					</li>
				</menu>
			</menu>
		</div>
	</div>
</div>

<style>
	.wrapper {
		width: 100%;
		height: 100%;
		position: relative;
		display: flex;
	}
	.column {
		position: relative;
		overflow: auto;
		flex: 1;
		padding: var(--spacing_md);
	}
	li {
		display: flex;
		flex-direction: column;
		padding: var(--spacing_lg) 0;
	}
	.menu li {
		padding: 0;
	}
	.menu-wrapper {
		height: 100%;
		overflow: auto;
	}
	.menu {
		position: sticky;
		top: 0;
		padding: var(--spacing_sm);
	}
	@media (max-width: 1500px) {
		.menu-wrapper {
			position: relative;
			transform: none;
			margin-bottom: var(--spacing_xl3);
		}
	}
	.menu {
		position: sticky;
		right: 0;
		top: 0;
	}
	.title {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.name {
		font-size: var(--font_size_lg);
		padding: var(--spacing_md);
	}
	.type {
		padding: var(--spacing_lg);
		background: none;
		font-family: var(--font_family_mono);
	}
	menu {
		margin-bottom: var(--spacing_lg);
	}
	.property {
		display: flex;
		align-items: center;
		padding: var(--spacing_md) var(--spacing_md) var(--spacing_md) var(--spacing_xl4);
		background-color: var(--tint_dark_1);
	}
	.property:nth-child(2n + 1) {
		background-color: var(--tint_dark_0);
	}
	.property > span {
		display: flex;
		width: 100px;
	}
</style>
