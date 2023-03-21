<script lang="ts">
	import EntityIcon from '$lib/ui/EntityIcon.svelte';
	import {randomHue} from '$lib/ui/color';
	import {GUEST_ACTOR_NAME} from '$lib/vocab/actor/constants';
	import type {EntityType} from '$lib/vocab/entity/entity.schema';
	import {getApp} from '$lib/ui/app';
	import type {ContextmenuItems} from '$lib/ui/contextmenu/contextmenu';

	export let name: string = GUEST_ACTOR_NAME; // TODO should this handle "default" or "empty" or "blank" avatars?
	export let icon: string | null = null;
	export let hue: number | undefined = undefined;
	export let showName = true;
	export let showIcon = true;
	export let type: EntityType = 'Persona';
	export let contextmenuAction: ContextmenuItems | null = null;
	export let inline = false;

	$: finalHue = hue ?? randomHue(name);

	const {
		ui: {contextmenu},
	} = getApp();
</script>

<!-- TODO add link option? -->

<span
	class="avatar"
	class:inline
	class:has-icon={showIcon}
	style="--hue: {finalHue}"
	use:contextmenu.action={contextmenuAction}
>
	{#if showIcon}<EntityIcon {name} {icon} {type} {inline} />{/if}{#if showName}<span class="actor"
			><slot />{name}</span
		>{/if}
</span>

<style>
	.avatar {
		display: flex;
		align-items: center;
	}
	.actor {
		font-weight: 700;
	}
	.avatar.has-icon .actor {
		padding-left: var(--spacing_xs);
	}
	.avatar.has-icon.inline .actor {
		padding-left: var(--spacing_xs3);
	}
	.avatar.inline,
	.avatar.inline .actor {
		display: inline;
	}
</style>
