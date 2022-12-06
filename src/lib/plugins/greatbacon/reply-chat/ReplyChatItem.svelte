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
	import Mention from '$lib/plugins/feltcoop/mention/Mention.svelte';

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
	$: repliedToPersona = $repliedToEntity && personaById.get($repliedToEntity.persona_id);

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
	<div class="icon">
		<PersonaAvatar persona={authorPersona} showName={false} />
	</div>
	<div class="formatted content">
		<div class="signature">
			<PersonaAvatar persona={authorPersona} showIcon={false} />
			<div class="controls">
				<small class="timestamp">{format($entity.created, 'Pp')}</small>
				<button
					class="plain-button icon-button reply"
					title="reply"
					on:click={() => selectReply(entity)}>↳</button
				>
			</div>
		</div>
		<div class="markup">
			{#if $repliedToEntity && $repliedToPersona}
				<div class="panel">
					<Mention name={$repliedToPersona.name} /> said:
					{$repliedToEntity.data.content}
				</div>
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
	.content {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding-left: var(--spacing_sm);
	}
	.signature {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.controls {
		display: flex;
		align-items: center;
	}
	.reply {
		--icon_size: var(--icon_size_sm);
		--input_height: var(--icon_size_sm);
	}
	.markup {
		/* needed for letters like y j g */
		padding-bottom: var(--spacing_xs3);
	}
	.panel {
		background-color: var(--tint_dark_2);
		padding: var(--spacing_xs);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		margin-bottom: var(--spacing_xs);
	}
</style>
