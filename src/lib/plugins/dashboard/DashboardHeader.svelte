<script lang="ts">
	import type {Readable} from '@getloom/svelte-gettable-stores';

	import type {Space} from '$lib/vocab/space/space.js';
	import type {Hub} from '$lib/vocab/hub/hub.js';
	import {getApp} from '$lib/ui/app.js';
	import HubAvatar from '$lib/ui/HubAvatar.svelte';
	import SpaceIcon from '$lib/ui/SpaceIcon.svelte';
	import type {AccountActor} from '$lib/vocab/actor/actor.js';

	const {
		ui: {expandMainNav, expandMarquee},
	} = getApp();

	export let actor: Readable<AccountActor> | null;
	export let space: Readable<Space> | null;
	export let hub: Readable<Hub> | null;
</script>

<ul
	class="dashboard-header"
	class:expanded-nav={$expandMainNav}
	class:expanded-marquee={$expandMarquee}
>
	<li class="luggage-placeholder" />
	<li class="breadcrumbs">
		{#if actor && hub && $hub}<HubAvatar
				{actor}
				{hub}
				showName={false}
				contextmenuParams={null}
			/><span class="title">{$hub.name}</span>{/if}{#if space}<span style:font-size="var(--size_lg)"
				><SpaceIcon {space} /></span
			>
			<span class="title">{$space?.name || ''}</span>{/if}
	</li>
	<li class="marquee-button-placeholder" />
</ul>

<style>
	.dashboard-header {
		display: flex;
		flex-direction: row;
		align-items: center;
		height: var(--navbar_size);
		width: 100%;
		overflow: hidden;
		background-color: var(--fg_1);
	}
	.breadcrumbs {
		--icon_size: var(--icon_size_sm);
		display: flex;
		align-items: center;
		padding-left: var(--spacing_xs);
		overflow: hidden;
	}
	.luggage-placeholder {
		width: var(--luggage_size);
		flex-shrink: 0;
		height: var(--navbar_size);
	}
	.marquee-button-placeholder {
		width: var(--navbar_size);
		flex-shrink: 0;
		height: var(--navbar_size);
	}
	.expanded-nav .luggage-placeholder,
	.expanded-marquee .marquee-button-placeholder {
		display: none;
	}
	:global(.mobile) .dashboard-header .luggage-placeholder,
	:global(.mobile) .dashboard-header .marquee-button-placeholder {
		display: block;
	}
	.title {
		padding: 0 var(--spacing_xs);
		white-space: nowrap;
	}
</style>
