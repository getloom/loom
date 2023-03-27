<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {slide, scale} from 'svelte/transition';

	import type {Entity} from '$lib/vocab/entity/entity';
	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import {randomHue} from '$lib/ui/color';
	import {getApp} from '$lib/ui/app';
	import ActorContextmenu from '$lib/app/contextmenu/ActorContextmenu.svelte';
	import EntityContextmenu from '$lib/app/contextmenu/EntityContextmenu.svelte';
	import EntityContent from '$lib/ui/EntityContent.svelte';
	import type {Space} from '$lib/vocab/space/space';
	import type {AccountPersona} from '$lib/vocab/actor/persona';
	import {lookupTies} from '$lib/vocab/tie/tieHelpers';
	import {lookupPersona} from '$lib/vocab/actor/actorHelpers';

	const {
		ui: {contextmenu, personaById, destTiesBySourceEntityId, entityById},
		actions,
	} = getApp();

	export let entity: Readable<Entity>;
	export let persona: Readable<AccountPersona>;
	export let space: Readable<Space>;

	$: destTies = lookupTies(destTiesBySourceEntityId, $entity.entity_id);

	$: items = Array.from($destTies.value).reduce((acc, tie) => {
		if (tie.type === 'HasItem') {
			acc.unshift(entityById.get(tie.dest_id)!);
		}
		return acc;
	}, [] as Array<Readable<Entity>>);

	$: authorPersona = lookupPersona(personaById, $entity.persona_id);

	// TODO refactor to some client view-model for the persona
	$: hue = randomHue($authorPersona.name);

	$: shouldRender = renderEntity($entity);

	let replying = false;
	let text = '';

	const renderEntity = (entity: Entity): boolean => {
		const type = entity.data.type;
		//1) Only render Collections or Notes
		if (!(type === 'Collection' || type === 'Note')) return false;
		return true;
	};
	const createEntity = async () => {
		const content = text.trim(); // TODO parse to trim? regularize step?
		if (!content) return;

		//TODO better error handling
		await actions.CreateEntity({
			actor: $persona.persona_id,
			space_id: $space.space_id,
			data: {type: 'Note', content},
			ties: [{source_id: $entity.entity_id}],
		});
		text = '';
		replying = false;
	};
	const onKeydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			await createEntity();
		}
	};

	let replyInputEl: HTMLTextAreaElement | undefined;
	$: replyInputEl?.focus();
</script>

<!-- TODO delete `ActorContextmenu` ? should that be handled by the entity contextmenu?
And then ActorContextmenu would be only for *session* personas? `SessionActorContextmenu` -->
{#if shouldRender}
	<li
		style="--hue: {hue}"
		in:slide|local
		out:scale|local
		use:contextmenu.action={[
			[EntityContextmenu, {persona, entity}],
			[ActorContextmenu, {persona: authorPersona}],
		]}
	>
		<div class="item markup">
			<button
				class="icon-button plain-button inline deselectable"
				class:selected={replying}
				title="reply to @{$authorPersona.name}"
				aria-label="reply to @{$authorPersona.name}"
				on:click={() => (replying = !replying)}>↩</button
			><ActorAvatar persona={authorPersona} inline={true} />
			<span class="content formatted">
				<EntityContent {entity} />
			</span>
		</div>
		{#if replying}
			<!-- TODO wrapping with a div looks a little less janky to me, but still not great -->
			<div in:slide|local class="reply-input panel">
				<ActorAvatar {persona} />
				<textarea
					placeholder="> replying to @{$authorPersona.name}"
					on:keydown={onKeydown}
					bind:value={text}
					bind:this={replyInputEl}
				/>
			</div>
		{/if}
		{#if items.length}
			<div class="items">
				<ol class="panel">
					{#each items as item (item)}
						<svelte:self entity={item} {space} {persona} />
					{/each}
				</ol>
			</div>
		{/if}
	</li>
{/if}

<style>
	.content {
		padding-left: var(--icon_size);
	}
	li {
		flex-direction: column;
		margin-bottom: var(--spacing_xl3);
	}
	li:last-child {
		margin-bottom: 0;
	}
	button {
		margin: 0;
		margin-right: var(--spacing_xs2);
		--icon_size: var(--icon_size_sm);
	}
	ol {
		padding: var(--spacing_xs);
	}
	.item {
		--icon_size: var(--icon_size_xs);
		/* TODO this shouldn't be needed after upgrading Felt for .markup -> .flow  */
		display: block;
	}
	.items {
		padding: var(--spacing_xs);
		padding-left: var(--spacing_xl3);
		padding-right: 0;
		padding-bottom: 0;
	}
	.reply-input {
		--icon_size: var(--icon_size_xs);
		/* TODO refactor these into Board-specific CSS vars on the top-level `Board` */
		margin-left: var(--spacing_xl3);
		padding: var(--spacing_xs);
		padding-left: calc(var(--icon_size_sm) + var(--spacing_xs2) + var(--spacing_xs));
		display: flex;
	}
	.reply-input textarea {
		margin-left: var(--icon_size);
	}
</style>
