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
	import type {AccountPersona} from '$lib/vocab/persona/persona';

	const {
		ui: {contextmenu, personaById, entityById, sourceTiesByDestEntityId},
	} = getApp();

	export let persona: Readable<AccountPersona>;
	export let entity: Readable<Entity>;
	export let selectReply: (reply: Readable<Entity>) => void;

	$: authorPersona = personaById.get($entity.persona_id)!;

	$: sourceTiesSet = sourceTiesByDestEntityId.get($entity.entity_id);
	$: replyTie =
		$sourceTiesSet?.value && Array.from($sourceTiesSet.value).find((t) => t.type === 'HasReply');
	$: repliedToEntity = replyTie && entityById.get(replyTie.source_id);

	// TODO refactor to some client view-model for the persona
	$: hue = randomHue($authorPersona.name);
</script>

<!-- TODO delete `PersonaContextmenu` ? should that be handled by the entity contextmenu?
And then PersonaContextmenu would be only for *session* personas? `SessionPersonaContextmenu` -->
<li
	style="--hue: {hue}"
	use:contextmenu.action={[
		[EntityContextmenu, {persona, entity}],
		[PersonaContextmenu, {persona: authorPersona}],
	]}
>
	<div class="signature">
		<PersonaAvatar persona={authorPersona} showName={false} />
	</div>
	<div class="markup padded-md formatted">
		<div class="signature">
			<PersonaAvatar persona={authorPersona} showIcon={false} />
			<div class="timestamp">{format($entity.created, 'Pp')}</div>
			<!-- TODO fix a11y -->
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div on:click={() => selectReply(entity)} class="reply">↳</div>
		</div>
		<div>
			{#if $repliedToEntity}
				<div class="panel">replied to: {$repliedToEntity.data.content}</div>
			{/if}
			<EntityContent {entity} />
		</div>
	</div>
</li>

<style>
	li {
		align-items: flex-start;
		padding: var(--spacing_xs);
		/* TODO experiment with a border color instead of bg */
		background-color: hsl(var(--hue), var(--bg_saturation), calc(var(--tint_lightness_8)));
	}
	.signature {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.markup {
		/* the bottom padding prevents chars like y and g from being cut off */
		padding: 0 0 var(--spacing_xs) var(--spacing_md);
	}
	.panel {
		background-color: var(--tint_dark_2);
	}
</style>
