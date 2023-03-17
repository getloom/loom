<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {format} from 'date-fns';

	import type {Entity} from '$lib/vocab/entity/entity';
	import PersonaAvatar from '$lib/ui/PersonaAvatar.svelte';
	import {randomHue} from '$lib/ui/color';
	import {getApp} from '$lib/ui/app';
	import PersonaContextmenu from '$lib/app/contextmenu/PersonaContextmenu.svelte';
	import EntityContextmenu from '$lib/app/contextmenu/EntityContextmenu.svelte';
	import EntityContent from '$lib/ui/EntityContent.svelte';
	import type {Space} from '$lib/vocab/space/space';
	import type {AccountPersona} from '$lib/vocab/persona/persona';
	import {lookupTies} from '$lib/vocab/tie/tieHelpers';
	import {lookupPersona} from '$lib/vocab/persona/personaHelpers';

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
			acc.push(entityById.get(tie.dest_id)!);
		}
		return acc;
	}, [] as Array<Readable<Entity>>);

	$: authorPersona = lookupPersona(personaById, $entity.persona_id);

	// TODO refactor to some client view-model for the persona
	$: hue = randomHue($authorPersona.name);

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

<!-- TODO delete `PersonaContextmenu` ? should that be handled by the entity contextmenu?
And then PersonaContextmenu would be only for *session* personas? `SessionPersonaContextmenu` -->
{#if renderEntity($entity)}
	<li
		style="--hue: {hue}"
		use:contextmenu.action={[
			[EntityContextmenu, {persona, entity}],
			[PersonaContextmenu, {persona: authorPersona}],
		]}
	>
		<div class="wrapper">
			<div class="signature">
				<PersonaAvatar persona={authorPersona} />
				{format($entity.created, 'Pp')}
			</div>

			<div class="markup formatted">
				{#if $entity.data.type === 'Collection'}
					<div>{$entity.data.name}</div>
					<div><EntityContent {entity} /></div>
				{:else}
					<EntityContent {entity} />
				{/if}
			</div>

			<div>
				<button
					class="icon-button plain-button"
					title="reply to @{$authorPersona.name}"
					aria-label="reply to @{$authorPersona.name}"
					on:click={() => (replying = !replying)}>↩</button
				>
				{#if replying}
					<textarea
						placeholder="> replying to @{$authorPersona.name}"
						on:keydown={onKeydown}
						bind:value={text}
						bind:this={replyInputEl}
					/>
				{/if}
			</div>
		</div>
		{#if items.length}
			<div class="items">
				<ul class="panel">
					{#each items as item (item)}
						<svelte:self entity={item} {space} {persona} />
					{/each}
				</ul>
			</div>
		{/if}
	</li>
{/if}

<style>
	.wrapper {
		width: 100%;
	}
	li {
		align-items: flex-start;
		flex-direction: column;
		margin-bottom: var(--spacing_xl3);
	}
	li:last-child {
		margin-bottom: 0;
	}
	ul {
		padding: var(--spacing_md);
		padding-right: var(--spacing_xs);
		padding-bottom: var(--spacing_xs);
	}
	.signature {
		display: flex;
		align-items: center;
		--icon_size: var(--icon_size_xs);
		justify-content: space-between;
	}
	.items {
		width: 100%;
		padding: var(--spacing_xs);
		padding-left: var(--spacing_xl3);
		padding-right: 0;
		padding-bottom: 0;
	}
</style>
