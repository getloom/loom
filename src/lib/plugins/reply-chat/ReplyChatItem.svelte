<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {format} from 'date-fns';
	import PendingAnimation from '@fuz.dev/fuz_library/PendingAnimation.svelte';
	import {to_contextmenu_params} from '@fuz.dev/fuz_contextmenu/contextmenu.js';

	import type {Entity} from '$lib/vocab/entity/entity';
	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import {randomHue} from '$lib/util/color';
	import {getApp} from '$lib/ui/app';
	import ActorContextmenu from '$lib/ui/ActorContextmenu.svelte';
	import EntityContextmenu from '$lib/ui/EntityContextmenu.svelte';
	import EntityContent from '$lib/ui/EntityContent.svelte';
	import type {AccountActor} from '$lib/vocab/actor/actor';
	import Mention from '$lib/plugins/mention/Mention.svelte';
	import {lookupActor} from '$lib/vocab/actor/actorHelpers';

	const {
		ui: {contextmenu, actorById, entityById, tiesByDestId},
	} = getApp();

	export let actor: Readable<AccountActor>;
	export let entity: Readable<Entity>;
	export let selectReply: (reply: Readable<Entity>) => void;
	export let queryReply: (entity_id: number, cb: (entity: Readable<Entity>) => void) => void;

	$: authorActor = lookupActor(actorById, $entity.actor_id);

	$: sourceTiesSet = tiesByDestId.get($entity.entity_id);
	$: replyTie =
		$sourceTiesSet?.value && Array.from($sourceTiesSet.value).find((t) => t.type === 'HasReply');

	$: repliedToEntity = replyTie && entityById.get(replyTie.source_id);
	$: if (replyTie && !repliedToEntity) {
		queryReply(replyTie.source_id, (entity) => (repliedToEntity = entity));
	}
	$: repliedToActor = lookupActor(actorById, $repliedToEntity?.actor_id);

	// TODO refactor to some client view-model for the actor
	$: hue = randomHue($authorActor.name);
</script>

<!-- TODO delete `ActorContextmenu` ? should that be handled by the entity contextmenu?
And then ActorContextmenu would be only for *session* actors? `SessionActorContextmenu` -->
<li
	style="--hue: {hue}"
	use:contextmenu.action={[
		to_contextmenu_params(EntityContextmenu, {actor, entity}),
		to_contextmenu_params(ActorContextmenu, {actor: authorActor}),
	]}
>
	<div class="icon">
		<ActorAvatar actor={authorActor} showName={false} />
	</div>
	<div class="formatted content">
		<div class="signature">
			<ActorAvatar actor={authorActor} showIcon={false} />
			<div class="controls">
				<small class="timestamp">{format($entity.created, 'MMM d, p')}</small>
				<button class="plain icon_button reply" title="reply" on:click={() => selectReply(entity)}
					>↳</button
				>
			</div>
		</div>
		<div class="prose">
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
		background-color: hsl(var(--hue), var(--tint_saturation), 89%);
	}
	/* TODO hacky */
	:global(.dark) li {
		background-color: hsl(var(--hue), var(--tint_saturation), 11%);
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
	.prose {
		/* needed for letters like y j g */
		padding-bottom: var(--spacing_xs3);
	}
	.panel {
		padding: var(--spacing_xs);
		margin-bottom: var(--spacing_xs);
	}
</style>
