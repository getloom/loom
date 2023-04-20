<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {format} from 'date-fns';
	import PendingAnimation from '@feltjs/felt-ui/PendingAnimation.svelte';

	import type {Entity} from '$lib/vocab/entity/entity';
	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import {randomHue} from '$lib/ui/color';
	import {getApp} from '$lib/ui/app';
	import ActorContextmenu from '$lib/app/contextmenu/ActorContextmenu.svelte';
	import EntityContextmenu from '$lib/app/contextmenu/EntityContextmenu.svelte';
	import EntityContent from '$lib/ui/EntityContent.svelte';
	import type {AccountActor} from '$lib/vocab/actor/actor';
	import Mention from '$lib/plugins/feltcoop/mention/Mention.svelte';
	import {lookupActor} from '$lib/vocab/actor/actorHelpers';

	const {
		ui: {contextmenu, actorById, entityById, sourceTiesByDestEntityId},
	} = getApp();

	export let persona: Readable<AccountActor>;
	export let entity: Readable<Entity>;
	export let selectReply: (reply: Readable<Entity>) => void;
	export let queryReply: (entity_id: number, cb: (entity: Readable<Entity>) => void) => void;

	$: authorActor = lookupActor(actorById, $entity.actor_id);

	$: sourceTiesSet = sourceTiesByDestEntityId.get($entity.entity_id);
	$: replyTie =
		$sourceTiesSet?.value && Array.from($sourceTiesSet.value).find((t) => t.type === 'HasReply');

	$: repliedToEntity = replyTie && entityById.get(replyTie.source_id);
	$: if (replyTie && !repliedToEntity) {
		queryReply(replyTie.source_id, (entity) => (repliedToEntity = entity));
	}
	$: repliedToActor = lookupActor(actorById, $repliedToEntity?.actor_id);

	// TODO refactor to some client view-model for the persona
	$: hue = randomHue($authorActor.name);
</script>

<!-- TODO delete `ActorContextmenu` ? should that be handled by the entity contextmenu?
And then ActorContextmenu would be only for *session* actors? `SessionActorContextmenu` -->
<li
	style="--hue: {hue}"
	use:contextmenu.action={[
		[EntityContextmenu, {persona, entity}],
		[ActorContextmenu, {persona: authorActor}],
	]}
>
	<div class="icon">
		<ActorAvatar persona={authorActor} showName={false} />
	</div>
	<div class="formatted content">
		<div class="signature">
			<ActorAvatar persona={authorActor} showIcon={false} />
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
			{#if replyTie}
				<div class="panel ellipsis">
					{#if $repliedToEntity}
						<Mention name={$repliedToActor.name} /> said:
						{$repliedToEntity.data.content}
					{:else}
						<PendingAnimation />
					{/if}
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
