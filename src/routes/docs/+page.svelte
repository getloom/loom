<script lang="ts">
	import {page} from '$app/stores';
	import {parseSchemaName} from '@feltjs/gro/dist/utils/schema.js';

	import SchemaInfo from '$lib/ui/SchemaInfo.svelte';
	import {actionDatas} from '$lib/vocab/action/actionData';
	import {modelSchemas} from '$lib/vocab/schemas';
	import {viewTemplates} from '$lib/vocab/view/view';

	const title = 'docs';

	$: hash = $page.url.hash.substring(1);

	// TODO use IntersectionObserver to update hash on scroll

	// TODO display plugins
	// TODO display source code links to views and actions and such

	const sortedActionDatas = actionDatas.slice().sort((a, b) => a.name.localeCompare(b.name));
	const sortedModelSchemas = modelSchemas.slice().sort((a, b) => a.$id.localeCompare(b.$id));
	const sortedViewTemplates = viewTemplates.slice().sort((a, b) => a.name.localeCompare(b.name));

	const schemaNames = sortedModelSchemas.map((s) => parseSchemaName(s.$id));
</script>

<svelte:head><title>{title}</title></svelte:head>

<div class="wrapper">
	<!-- TODO extract an accessible menu component, see PRS
	https://github.com/feltjs/felt-server/pull/362
	and https://github.com/feltjs/felt-ui/pull/197 -->
	<div class="nav-wrapper prose padded_xl width_sm">
		<nav>
			<h3><a href="#docs" class:selected={hash === 'docs'}>docs</a></h3>
			<h4><a href="#views" class:selected={hash === 'views'}>views</a></h4>
			<menu>
				{#each sortedViewTemplates as viewTemplate (viewTemplate)}
					<li>
						<a href="#{viewTemplate.name}" class:selected={hash === viewTemplate.name}
							>{viewTemplate.name}</a
						>
					</li>
				{/each}
			</menu>
			<h4><a href="#models" class:selected={hash === 'models'}>models</a></h4>
			<menu>
				{#each sortedModelSchemas as schema, i (schema)}
					{@const name = schemaNames[i]}
					<li>
						<a href="#{name}" class:selected={hash === name}>{name}</a>
					</li>
				{/each}
			</menu>
			<h4><a href="#actions" class:selected={hash === 'actions'}>actions</a></h4>
			<menu>
				{#each sortedActionDatas as actionData (actionData.name)}
					<li>
						<a href="#{actionData.name}" class:selected={hash === actionData.name}
							>{actionData.name}</a
						>
					</li>
				{/each}
			</menu>
			<footer>
				<h4><code>@feltjs/felt-server</code></h4>
				<div><a href="https://github.com/feltjs/felt-server">GitHub</a></div>
				<div><a href="https://npmjs.com/@feltjs/felt-server">npm</a></div>
				<div><a href="https://www.felt.dev">felt.dev</a> 💚</div>
			</footer>
		</nav>
	</div>
	<div class="content">
		<div class="prose padded_xl">
			<h1 id="docs">docs</h1>
		</div>
		<div class="prose padded_xl">
			<h2 id="views">views</h2>
		</div>
		<ul>
			{#each sortedViewTemplates as viewTemplate (viewTemplate)}
				<li class="view-template" id={viewTemplate.name}>
					<div class="title padded_xs">
						<span style:font-size="var(--size_lg)">
							{viewTemplate.icon}
							{viewTemplate.name}
						</span>
						{#if viewTemplate.creatable !== false}
							<span class="chip" title="users can create this view in normal circumstances"
								>creatable</span
							>
						{/if}
						{#if viewTemplate.admin}
							<span class="chip" title="requires instance admin permissions">admin</span>
						{/if}
					</div>
					<code class="padded_xs">{viewTemplate.view}</code>
				</li>
			{/each}
		</ul>
		<hr />
		<div class="prose padded_xl">
			<h2 id="models">models</h2>
		</div>
		<ul>
			{#each sortedModelSchemas as schema, i (schema)}
				{@const name = schemaNames[i]}
				<li id={name}>
					<SchemaInfo {schema} />
				</li>
			{/each}
		</ul>
		<hr />
		<div class="prose padded_xl">
			<h2 id="actions">actions</h2>
		</div>
		<ul>
			{#each sortedActionDatas as actionData (actionData.name)}
				<li id={actionData.name}>
					<div class="title">
						<code class="name">{actionData.name}</code>
						<small class="type">{actionData.type}</small>
					</div>
					{#if actionData.type !== 'ClientAction'}
						<div class="property">
							<span>endpoint</span>
							<span>{actionData.route.method}</span>
							<span>{actionData.route.path}</span>
						</div>
					{/if}
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
		<div class="prose padded_xl">
			<menu>
				<li><h3><a href="#docs" class:selected={hash === 'docs'}>docs</a></h3></li>
				<menu>
					<li>
						<h4>
							<a href="#models" class:selected={hash === 'models'}>models</a>
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
	.content {
		width: 100%;
		max-width: var(--width_md);
		position: relative;
		overflow: auto;
		flex: 1;
		padding: var(--spacing_md);
	}
	li {
		display: flex;
		flex-direction: column;
		padding: var(--spacing_xl3) 0;
	}
	nav li {
		padding: 0;
	}
	.nav-wrapper {
		height: 100%;
		overflow: auto;
	}
	nav {
		position: sticky;
		top: 0;
		right: 0;
		padding: var(--spacing_sm);
		flex-direction: column;
	}
	@media (max-width: 1500px) {
		.nav-wrapper {
			position: relative;
			transform: none;
			margin-bottom: var(--spacing_xl3);
		}
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
	menu {
		margin-bottom: var(--spacing_lg);
	}
	.property {
		display: flex;
		align-items: center;
		padding: var(--spacing_md) var(--spacing_md) var(--spacing_md) var(--spacing_xl4);
		background-color: var(--fg_1);
	}
	.property:nth-child(2n + 1) {
		background-color: var(--fg_0);
	}
	.property > span {
		display: flex;
		width: 100px;
	}
</style>
