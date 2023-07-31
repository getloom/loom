<script lang="ts">
	import {browser} from '$app/environment';
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {toDialogParams} from '@feltjs/felt-ui/dialog.js';

	import {getApp} from '$lib/ui/app';
	import {getSpaceContext} from '$lib/vocab/view/view';
	import EntityEditor from '$lib/ui/EntityEditor.svelte';
	import type {Entity} from '$lib/vocab/entity/entity';
	import EntityContent from '$lib/ui/EntityContent.svelte';
	import RolesList from '$lib/ui/RolesList.svelte';

	const {actor, space} = getSpaceContext();

	const {socket, actions, createQuery} = getApp();

	const DEFAULT_RULES = `<ol><li>No tolerance for any sort of hate and discrimination such as racism, sexism, ableism, transphobia, etc.</li><li>No spamming</li><li>If there is a conflict, please report issues to community leaders</li></ol>`;
	const DEFAULT_NORMS = `<p>some thoughts about our community’s vibes that aren’t rules, but still worth thinking about</p><ol><li>We welcome nerdiness :)</li><li>We strive to learn from each other.</li><li>We encourage everyone to participate in moderation.</li></ol>`;

	$: shouldLoadEntities = browser && $socket?.open; // TODO @multiple hoist this logic and use correct client automatically

	$: query = shouldLoadEntities
		? createQuery({
				actor: $actor.actor_id,
				source_id: $space.directory_id,
		  })
		: null;
	$: entities = query?.entities;

	let rules: Readable<Entity> | undefined;
	let norms: Readable<Entity> | undefined;

	$: rules = $entities?.value.find((e) => e.get().data.name === 'rules');
	$: norms = $entities?.value.find((e) => e.get().data.name === 'norms');

	const createEntity = async (text: string, name: string) => {
		const content = text.trim(); // TODO parse to trim? regularize step?

		if (!content) return;
		await actions.CreateEntity({
			actor: $actor.actor_id,
			space_id: $space.space_id,
			data: {type: 'Article', content, name},
			ties: [{source_id: $space.directory_id}],
		});
	};

	$: if ($query?.status === 'success' && !$rules && !$norms) {
		//TODO initialize these with hub, not user actor
		void createEntity(DEFAULT_RULES, 'rules');
		void createEntity(DEFAULT_NORMS, 'norms');
	}
</script>

<!--TODO extract stuff below into new component-->
<div class="home">
	<section class="prose padded_xl">
		<p>
			<strong>
				Here's our hub rules and norms!<br />
				Please feel free to voice your thoughts about them. Deliberation is always helpful for maintaining
				a healthy hub.
			</strong>
		</p>
	</section>
	<section class="rules-and-norms">
		<div class="rules prose padded_xl panel">
			<div class="header">
				<h4>rules</h4>
				<!--TODO how to trigger a directory freshen from result of this dialogue-->
				<button
					on:click={() => {
						if (rules) {
							actions.OpenDialog(
								toDialogParams(EntityEditor, {actor, entity: rules}, {layout: 'page'}),
							);
						}
					}}
					disabled={!$rules}
					title="propose change"
				>
					✎
				</button>
			</div>
			{#if rules}<EntityContent entity={rules} />{:else}rules not found{/if}
		</div>
		<div class="norms prose padded_xl panel">
			<div class="header">
				<h4>norms</h4>
				<button
					on:click={() => {
						if (norms) {
							actions.OpenDialog(
								toDialogParams(EntityEditor, {actor, entity: norms}, {layout: 'page'}),
							);
						}
					}}
					disabled={!$norms}
					title="propose change"
				>
					✎
				</button>
			</div>
			{#if norms}<EntityContent entity={norms} />{:else}norms not found{/if}
		</div>
	</section>
	<section class="roles">
		<div class="panel">
			<h2>roles</h2>
			<RolesList />
		</div>
	</section>
</div>

<style>
	.header {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	}

	.rules-and-norms {
		display: flex;
	}
	.rules,
	.norms {
		flex: 1;
		min-height: 200px;
		margin-left: var(--spacing_xl);
		margin-right: var(--spacing_xl);
	}

	.norms {
		margin-left: 0;
	}

	.roles {
		margin: var(--spacing_xl);
	}
	.roles .panel {
		padding: var(--spacing_xl);
	}
</style>
