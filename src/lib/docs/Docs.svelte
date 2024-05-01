<script lang="ts">
	import {page} from '$app/stores';
	import {base} from '$app/paths';
	import {strip_start} from '@ryanatkn/belt/string.js';
	import {writable} from '@feltcoop/svelte-gettable-stores';

	import {
		guideItemsBySlug,
		userGuideItems,
		adminGuideItems,
		devGuideItems,
		setDocsSettings,
	} from '$lib/docs/docs.js';
	import DocsContent from '$lib/docs/DocsContent.svelte';
	import DocsGuideContent from '$lib/docs/DocsGuideContent.svelte';
	import DocsGuideUserContent from '$lib/docs/DocsGuideUserContent.svelte';
	import DocsGuideAdminContent from '$lib/docs/DocsGuideAdminContent.svelte';
	import DocsGuideDevContent from '$lib/docs/DocsGuideDevContent.svelte';	

	export let path = '/docs';

	const docsSettings = setDocsSettings(writable({path}));
	$: if ($docsSettings.path !== path) $docsSettings = {path};

	// TODO improve how this component interacts with SvelteKit routing --
	// it's designed like this so it can be imported as a library component and keep the user's routing simple

	$: pathname = strip_start($page.url.pathname, base);

	$: path_guide = path + '/guide';
	$: path_guide_user = path + '/guide/user';
	$: path_guide_admin = path + '/guide/admin';
	$: path_guide_dev = path + '/guide/dev';	

	$: title =
		pathname === path_guide
			? 'loom guide'
			: pathname === path_guide_user
				? 'loom user guide'
				: pathname === path_guide_admin
					? 'loom admin guide'
					: pathname === path_guide_dev
						? 'loom dev guide'
							: 'loom docs';

	$: showGuideContent = pathname.startsWith(path_guide);	

	const toGuideSlug = (p: string, path: string): string | null => {
		const guidePrefix = path + '/guide/';
		if (!p.startsWith(guidePrefix)) return null;
		return strip_start(p, guidePrefix);
	};
	$: guideSlug = toGuideSlug(pathname, path);
	$: selectedGuideItem = guideSlug ? guideItemsBySlug.get(guideSlug) : null;
</script>

<svelte:head><title>{title}</title></svelte:head>

<div class="wrapper">
	<!-- TODO extract an accessible menu component, see PRS
	https://github.com/getloom/loom/pull/362
	and https://github.com/fuz-dev/fuz/pull/197 -->
	<div class="sidebar padded_1 width_sm">
		<slot name="header"><header>@getloom/loom</header></slot>
		<nav>
			<h2><a href="{base}{path}" class:selected={pathname === path}>docs</a></h2>
			<h3><a href="{base}{path_guide}" class:selected={showGuideContent}>guide</a></h3>
			<h4>
				<a href="{base}{path_guide_user}" class:selected={pathname.startsWith(path_guide_user)}>
					user
				</a>
			</h4>
			{#if showGuideContent}
				<ol>
					{#each userGuideItems as guideItem}
						<li>
							<a
								class:selected={guideItem === selectedGuideItem}
								href="{base}{path_guide}/{guideItem.slug}">{guideItem.name}</a
							>
						</li>
					{/each}
				</ol>
			{/if}
			<h4>
				<a href="{base}{path_guide_admin}" class:selected={pathname.startsWith(path_guide_admin)}>
					admin
				</a>
			</h4>
			{#if showGuideContent}
				<ol>
					{#each adminGuideItems as guideItem}
						<li>
							<a
								class:selected={guideItem === selectedGuideItem}
								href="{base}{path_guide}/{guideItem.slug}">{guideItem.name}</a
							>
						</li>
					{/each}
				</ol>
			{/if}
			<h4>
				<a href="{base}{path_guide_dev}" class:selected={pathname.startsWith(path_guide_dev)}>
					dev
				</a>
			</h4>
			{#if showGuideContent}
				<ol>
					{#each devGuideItems as guideItem}
						<li>
							<a
								class:selected={guideItem === selectedGuideItem}
								href="{base}{path_guide}/{guideItem.slug}">{guideItem.name}</a
							>
						</li>
					{/each}
				</ol>
			{/if}
		</nav>
		<footer>
			<slot name="footer">
				<div class="prose">
					<p class="text_align_center width_full" style:margin-top="var(--spacing_sm)">
						<a href="{base}/">back home</a>
					</p>
					<div class="text_align_center">@getloom/loom</div>
					<div class="links">
						<a href="https://github.com/getloom/loom">GitHub</a>∙<a
							href="https://npmjs.com/@getloom/loom">npm</a
						>∙<a href="https://www.getloom.org">getloom.org</a>
					</div>
				</div>
			</slot>
		</footer>
	</div>
	<div class="content">
		<!--
			TODO this is hacky routing but IDK how to better integrate with SvelteKit
			for this usecase mounting Docs from a library to handle multiple routes
		-->
		<slot>
			{#if pathname === path}
				<div class="prose">
					<h1>Docs</h1>
				</div>
				<DocsContent />
			{:else if pathname === path_guide}
				<DocsGuideContent />
			{:else if pathname === path_guide_user}
				<DocsGuideUserContent />
			{:else if pathname === path_guide_admin}
				<DocsGuideAdminContent />
			{:else if pathname === path_guide_dev}
				<DocsGuideDevContent />
			{:else if selectedGuideItem}
				{#if pathname.startsWith(path_guide_user + '/')}
					<DocsGuideUserContent
						><svelte:component this={selectedGuideItem.component} /></DocsGuideUserContent
					>
				{:else if pathname.startsWith(path_guide_admin + '/')}
					<DocsGuideAdminContent
						><svelte:component this={selectedGuideItem.component} /></DocsGuideAdminContent
					>
				{:else if pathname.startsWith(path_guide_dev + '/')}
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
		padding-bottom: var(--spacing_6);
	}
	ol,
	li {
		display: flex;
		flex-direction: column;
	}
	.sidebar {
		height: 100%;
		overflow: auto;
	}
	header {
		margin-bottom: var(--spacing_md);
		padding: var(--spacing_sm);
	}
	nav {
		flex-direction: column;
	}
	nav li {
		padding: 0;
	}
	/* TODO hacky, gets the `Vocab` */
	nav :global(a) {
		border-radius: var(--border_radius_xs);
		padding: var(--spacing_xs3) var(--spacing_sm);
	}
	nav :global(a:not(:hover)) {
		--text_decoration_selected: none;
	}
	nav h3 a {
		padding: var(--spacing_xs2) var(--spacing_sm);
	}
	nav h2 a {
		padding: var(--spacing_xs) var(--spacing_sm);
	}
	/* TODO hacky, gets the `Vocab` */
	nav :global(a.selected) {
		background-color: var(--fg_1);
	}
	@media (max-width: 1500px) {
		.sidebar {
			position: relative;
			transform: none;
			margin-bottom: var(--spacing_3);
		}
	}
	h4 {
		padding-left: var(--spacing_3);
	}
	footer {
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: var(--fg_1);
		border-radius: var(--border_radius_sm);
		padding: var(--spacing_sm);
		margin: var(--spacing_5) 0;
	}
	.links {
		display: flex;
		justify-content: center;
		margin: var(--spacing_sm) 0;
	}
	footer a {
		padding: var(--spacing_xs2) var(--spacing_sm);
	}
</style>
