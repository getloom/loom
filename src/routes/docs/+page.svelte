<script lang="ts">
	import {page} from '$app/stores';

	import SchemaInfo from '$lib/ui/SchemaInfo.svelte';
	import {actionDatas} from '$lib/vocab/action/actionData';
	import {modelSchemas} from '$lib/vocab/schemas';
	import {viewTemplates} from '$lib/vocab/view/view';
	import ActionInfo from '$lib/ui/ActionInfo.svelte';
	import ViewInfo from '$lib/ui/ViewInfo.svelte';
	import {toSchemaName} from '$lib/util/schema';
	import Vocab from '$lib/plugins/vocab/Vocab.svelte';

	const title = 'docs';

	$: hash = $page.url.hash.substring(1);

	// TODO use IntersectionObserver to update hash on scroll

	// TODO display plugins
	// TODO display source code links to views and actions and such

	const sortedActionDatas = actionDatas.slice().sort((a, b) => a.name.localeCompare(b.name));
	const sortedModelSchemas = modelSchemas.slice().sort((a, b) => a.$id.localeCompare(b.$id));
	const sortedViewTemplates = viewTemplates.slice().sort((a, b) => a.name.localeCompare(b.name));

	const schemaNames = sortedModelSchemas.map((s) => toSchemaName(s.$id));
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
				{#each sortedViewTemplates as viewTemplate}
					<li>
						<a href="#{viewTemplate.name}" class:selected={hash === viewTemplate.name}
							>{viewTemplate.name}</a
						>
					</li>
				{/each}
			</menu>
			<h4><a href="#models" class:selected={hash === 'models'}>models</a></h4>
			<menu>
				{#each schemaNames as name}
					<li>
						<Vocab {name} selected={hash === name} plain={true} />
					</li>
				{/each}
			</menu>
			<h4><a href="#actions" class:selected={hash === 'actions'}>actions</a></h4>
			<menu>
				{#each sortedActionDatas as { name } (name)}
					<li>
						<Vocab {name} selected={hash === name} plain={true} />
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
			<aside>
				documentation is a work in progress, thank you for your patience 💚 see also <a
					href="https://github.com/feltjs/felt-server">the repo's readme</a
				>
			</aside>
		</div>
		<div class="prose padded_xl">
			<h2 id="views">views</h2>
		</div>
		<ul>
			{#each sortedViewTemplates as view}
				<li id={view.name}>
					<ViewInfo {view} />
				</li>
			{/each}
		</ul>
		<hr />
		<div class="prose padded_xl">
			<h2 id="models">models</h2>
		</div>
		<ul>
			{#each sortedModelSchemas as schema, i}
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
			{#each sortedActionDatas as action}
				<li id={action.name}>
					<ActionInfo {action} />
				</li>
			{/each}
		</ul>
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
	menu {
		margin-bottom: var(--spacing_lg);
	}
</style>
