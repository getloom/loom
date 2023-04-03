<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {format} from 'date-fns';

	import type {Entity} from '$lib/vocab/entity/entity';
	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import {randomHue} from '$lib/ui/color';
	import {getApp} from '$lib/ui/app';
	import ActorContextmenu from '$lib/app/contextmenu/ActorContextmenu.svelte';
	import EntityContextmenu from '$lib/app/contextmenu/EntityContextmenu.svelte';
	import EntityContent from '$lib/ui/EntityContent.svelte';
	import type {AccountActor} from '$lib/vocab/actor/actor';
	import Mention from '$lib/plugins/feltcoop/mention/Mention.svelte';
	import {lookupPersona} from '$lib/vocab/actor/actorHelpers';

	const {
		ui: {contextmenu, personaById, entityById, sourceTiesByDestEntityId},
	} = getApp();

	export let persona: Readable<AccountActor>;
	export let entity: Readable<Entity>;
	export let selectReply: (reply: Readable<Entity>) => void;

	$: authorPersona = lookupPersona(personaById, $entity.persona_id);

	$: sourceTiesSet = sourceTiesByDestEntityId.get($entity.entity_id);
	$: replyTie =
		$sourceTiesSet?.value && Array.from($sourceTiesSet.value).find((t) => t.type === 'HasReply');
	$: repliedToEntity = replyTie && entityById.get(replyTie.source_id);
	$: repliedToPersona = $repliedToEntity && lookupPersona(personaById, $repliedToEntity.persona_id);

	// TODO refactor to some client view-model for the persona
	$: hue = randomHue($authorPersona.name);
</script>

<!-- TODO delete `ActorContextmenu` ? should that be handled by the entity contextmenu?
And then ActorContextmenu would be only for *session* personas? `SessionActorContextmenu` -->
<li
	style="--hue: {hue}"
	use:contextmenu.action={[
		[EntityContextmenu, {persona, entity}],
		[ActorContextmenu, {persona: authorPersona}],
	]}
>
	<div class="icon">
		<ActorAvatar persona={authorPersona} showName={false} />
	</div>
	<div class="formatted content">
		<div class="signature">
			<ActorAvatar persona={authorPersona} showIcon={false} />
			<div class="controls">
				<small class="timestamp">{format($entity.created, 'MMM d, p')}</small>
				<button
					class="plain-button icon-button reply"
					title="reply"
					on:click={() => selectReply(entity)}>↳</button
				>
			</div>
		</div>
		<div class="markup">
			{#if $repliedToEntity && $repliedToPersona}
				<div class="panel ellipsis">
					<Mention name={$repliedToPersona.name} /> said:
					{$repliedToEntity.data.content}
				</div>
			{/if}<EntityContent {entity} />
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
	}
	.markup {
		/* needed for letters like y j g */
		padding-bottom: var(--spacing_xs3);
	}
	.panel {
		background-color: var(--tint_dark_2);
		padding: var(--spacing_xs);
		margin-bottom: var(--spacing_xs);
	}
</style>
