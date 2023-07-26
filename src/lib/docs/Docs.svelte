<script lang="ts">
	import {page} from '$app/stores';
	import {base} from '$app/paths';
	import {stripStart} from '@feltjs/util/string.js';
	import Breadcrumbs from '@feltjs/felt-ui/Breadcrumbs.svelte';

	import {actionDatas} from '$lib/vocab/action/actionData';
	import {modelSchemas} from '$lib/vocab/schemas';
	import {viewTemplates} from '$lib/vocab/view/view';
	import {toSchemaName} from '$lib/util/schema';
	import Vocab from '$lib/plugins/vocab/Vocab.svelte';
	import {guideItemsBySlug, userGuideItems, adminGuideItems, devGuideItems} from '$lib/docs/guide';
	import DocsContent from '$lib/docs/DocsContent.svelte';
	import DocsGuideContent from '$lib/docs/DocsGuideContent.svelte';
	import DocsGuideUserContent from '$lib/docs/DocsGuideUserContent.svelte';
	import DocsGuideAdminContent from '$lib/docs/DocsGuideAdminContent.svelte';
	import DocsGuideDevContent from '$lib/docs/DocsGuideDevContent.svelte';
	import DocsVocabContent from '$lib/docs/DocsVocabContent.svelte';
	import type {ClientActionData, ServiceActionData} from '$lib/vocab/action/action';

	// TODO improve how this component interacts with SvelteKit routing --
	// it's designed like this so it can be imported as a library component and keep the user's routing simple

	$: ({pathname} = $page.url);
	$: basePathname = stripStart(pathname, base);

	$: hash = $page.url.hash.substring(1);

	// TODO display source code links to views and actions and such

	const sortedModelSchemas = modelSchemas.slice().sort((a, b) => a.$id.localeCompare(b.$id));
	const sortedViewTemplates = viewTemplates.slice().sort((a, b) => a.name.localeCompare(b.name));
	const clientActions = actionDatas
		.filter((a) => a.type === 'ClientAction')
		.sort((a, b) => a.name.localeCompare(b.name)) as ClientActionData[];
	const serviceActions = actionDatas
		.filter((a) => a.type === 'ServiceAction')
		.sort((a, b) => a.name.localeCompare(b.name)) as ServiceActionData[];

	const schemaNames = sortedModelSchemas.map((s) => toSchemaName(s.$id));

	$: title =
		basePathname === '/docs/guide'
			? 'felt guide'
			: basePathname === '/docs/guide/user'
			? 'felt user guide'
			: basePathname === '/docs/guide/admin'
			? 'felt admin guide'
			: basePathname === '/docs/guide/dev'
			? 'felt dev guide'
			: basePathname === '/docs/vocab'
			? 'felt vocab docs'
			: 'felt docs';

	$: showGuideContent = basePathname.startsWith('/docs/guide');
	$: showVocabContent = basePathname.startsWith('/docs/vocab');

	const toGuideSlug = (p: string): string | null => {
		if (!p.startsWith('/docs/guide/')) return null;
		return stripStart(p, '/docs/guide/');
	};
	$: guideSlug = toGuideSlug(basePathname);
	$: selectedGuideItem = guideSlug ? guideItemsBySlug.get(guideSlug) : null;
</script>

<svelte:head><title>{title}</title></svelte:head>

<div class="wrapper">
	<!-- TODO extract an accessible menu component, see PRS
	https://github.com/feltjs/felt-server/pull/362
	and https://github.com/feltjs/felt-ui/pull/197 -->
	<div class="nav-wrapper prose padded_xl width_sm">
		<nav>
			<h2><a href="{base}/docs" class:selected={basePathname === '/docs'}>docs</a></h2>
			<h3><a href="{base}/docs/guide" class:selected={showGuideContent}>guide</a></h3>
			<h4>
				<a href="{base}/docs/guide/user" class:selected={basePathname === '/docs/guide/user'}>
					user
				</a>
			</h4>
			{#if showGuideContent}
				<ol>
					{#each userGuideItems as guideItem}
						<li>
							<a
								class:selected={guideItem === selectedGuideItem}
								href="{base}/docs/guide/{guideItem.slug}">{guideItem.name}</a
							>
						</li>
					{/each}
				</ol>
			{/if}
			<h4>
				<a href="{base}/docs/guide/admin" class:selected={basePathname === '/docs/guide/admin'}>
					admin
				</a>
			</h4>
			{#if showGuideContent}
				<ol>
					{#each adminGuideItems as guideItem}
						<li>
							<a
								class:selected={guideItem === selectedGuideItem}
								href="{base}/docs/guide/{guideItem.slug}">{guideItem.name}</a
							>
						</li>
					{/each}
				</ol>
			{/if}
			<h4>
				<a href="{base}/docs/guide/dev" class:selected={basePathname === '/docs/guide/dev'}>
					dev
				</a>
			</h4>
			{#if showGuideContent}
				<ol>
					{#each devGuideItems as guideItem}
						<li>
							<a
								class:selected={guideItem === selectedGuideItem}
								href="{base}/docs/guide/{guideItem.slug}">{guideItem.name}</a
							>
						</li>
					{/each}
				</ol>
			{/if}

			<h3><a href="{base}/docs/vocab#vocab" class:selected={showVocabContent}>vocab</a></h3>
			{#if showVocabContent}
				<h4><a href="{base}/docs/vocab/#views" class:selected={hash === 'views'}>views</a></h4>
				<menu>
					{#each sortedViewTemplates as viewTemplate}
						<li>
							<a href="#{viewTemplate.name}" class:selected={hash === viewTemplate.name}
								>{viewTemplate.name}</a
							>
						</li>
					{/each}
				</menu>
				<h4><a href="{base}/docs/vocab/#models" class:selected={hash === 'models'}>models</a></h4>
				<menu>
					{#each schemaNames as name}
						<li>
							<Vocab {name} selected={hash === name} plain={true} />
						</li>
					{/each}
				</menu>
				<h4>
					<a href="{base}/docs/vocab/#service_actions" class:selected={hash === 'service_actions'}
						>service actions</a
					>
				</h4>
				<menu>
					{#each serviceActions as { name } (name)}
						<li>
							<Vocab {name} selected={hash === name} plain={true} />
						</li>
					{/each}
				</menu>
				<h4>
					<a href="{base}/docs/vocab/#client_actions" class:selected={hash === 'client_actions'}
						>client actions</a
					>
				</h4>
				<menu>
					{#each clientActions as { name } (name)}
						<li>
							<Vocab {name} selected={hash === name} plain={true} />
						</li>
					{/each}
				</menu>
			{/if}
			<footer>
				<Breadcrumbs>💚</Breadcrumbs>
				<div class="links">
					<a href="https://github.com/feltjs/felt-server">GitHub</a>∙<a
						href="https://npmjs.com/@feltjs/felt-server">npm</a
					>∙<a href="https://www.felt.dev">felt.dev</a>
				</div>
			</footer>
		</nav>
	</div>
	<div class="content">
		<slot>
			{#if basePathname === '/docs'}
				<div class="prose">
					<h1>Docs</h1>
				</div>
				<DocsContent />
			{:else if basePathname === '/docs/guide'}
				<DocsGuideContent />
			{:else if basePathname === '/docs/guide/user'}
				<DocsGuideUserContent />
			{:else if basePathname === '/docs/guide/admin'}
				<DocsGuideAdminContent />
			{:else if basePathname === '/docs/guide/dev'}
				<DocsGuideDevContent />
			{:else if basePathname === '/docs/vocab'}
				<DocsVocabContent
					{sortedViewTemplates}
					{sortedModelSchemas}
					{serviceActions}
					{clientActions}
					{schemaNames}
				/>
			{:else if selectedGuideItem}
				{#if basePathname.startsWith('/docs/guide/user/')}
					<DocsGuideUserContent
						><svelte:component this={selectedGuideItem.component} /></DocsGuideUserContent
					>
				{:else if basePathname.startsWith('/docs/guide/admin/')}
					<DocsGuideAdminContent
						><svelte:component this={selectedGuideItem.component} /></DocsGuideAdminContent
					>
				{:else if basePathname.startsWith('/docs/guide/dev/')}
					<DocsGuideDevContent
						><svelte:component this={selectedGuideItem.component} /></DocsGuideDevContent
					>
				{/if}
			{/if}
		</slot>
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
	ol,
	menu {
		padding-left: var(--spacing_xl6);
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
	h4 {
		padding-left: var(--spacing_xl3);
	}
	footer {
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: var(--fg_1);
		border-radius: var(--border_radius_sm);
		padding: var(--spacing_md);
		margin: var(--spacing_xl5) 0;
	}
	footer .links {
		margin: var(--spacing_sm) 0;
	}
	footer a {
		padding: var(--spacing_xs2) var(--spacing_sm);
	}
</style>
