<script lang="ts">
	import {base} from '$app/paths';
	import {page} from '$app/stores';

	import {getDocsSettings} from '$lib/docs/docs';

	type GuideName = 'user' | 'admin' | 'dev';

	export let guide: GuideName;

	const docsSettings = getDocsSettings();
	$: ({path} = $docsSettings);

	const icons: Record<GuideName, string> = {
		user: '🎭',
		admin: '🪄',
		dev: '🧰',
	};

	$: icon = icons[guide];
	$: href = `${base}${path}/guide/${guide}`;
	$: ({pathname} = $page.url);
	$: selected = href === pathname;
</script>

<a class="panel" {href} class:selected>
	<div class="icon">{icon}</div>
	<div class="title">{guide}</div></a
>

<style>
	a {
		display: flex;
		flex-direction: row;
		align-items: center;
		padding: var(--spacing_md);
		max-width: var(--width_sm);
		width: 100%;
	}
	a,
	a:hover {
		text-decoration: none;
	}
	a.selected .title,
	a:hover .title {
		text-decoration: underline;
	}
	.icon {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		font-size: var(--icon_size_md);
		width: calc(var(--icon_size_md) + var(--spacing_1) + var(--spacing_md));
		padding-right: var(--spacing_1);
		padding-left: var(--spacing_md);
	}
	.title {
		font-size: var(--size_1);
		margin-bottom: var(--spacing_sm);
	}
</style>
