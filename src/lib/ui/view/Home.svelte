<script lang="ts">
	import {browser} from '$app/environment';
	import {writable, type Readable} from '@feltcoop/svelte-gettable-stores';

	import {getApp} from '$lib/ui/app';
	import {getViewContext} from '$lib/vocab/view/view';
	import Forum from '$lib/ui/view/Forum.svelte';
	import EntityEditor from '$lib/ui/EntityEditor.svelte';
	import type {Entity} from '$lib/vocab/entity/entity';
	import EntityContent from '$lib/ui/EntityContent.svelte';
	import NewcomerSubmission from '$lib/ui/NewcomerSubmission.svelte';
	import RolesList from '$lib/ui/RolesList.svelte';

	const viewContext = getViewContext();
	$: ({space, persona} = $viewContext);

	const {socket, dispatch} = getApp();

	const DEFAULT_RULES = `<ol>
				<li>
					No tolerance for any sort of hate and discrimination such as racism, sexism, ableism,
					transphobia, etc.
				</li>
				<li>No spamming</li>
				<li>If there is a conflict, please report issues to community leaders</li>
			</ol>`;

	const DEFAULT_NORMS = `<p>
				some thoughts about our community’s vibes that aren’t rules, but still worth thinking about
			</p>
			<ol>
				<li>We welcome nerdiness :)</li>
				<li>We strive to learn from each other.</li>
				<li>We encourage everyone to participate in moderation.</li>
			</ol>`;

	$: shouldLoadEntities = browser && $socket.open;

	//TODO this is all done because the Query event always returns an empty array on initial call
	$: entitiesResult = shouldLoadEntities
		? dispatch.ReadEntities({
				actor: $persona.persona_id,
				source_id: $space.directory_id,
		  })
		: null;
	let entities: Entity[] | undefined;
	let rules: Readable<Entity> | undefined;
	let norms: Readable<Entity> | undefined;

	$: void entitiesResult?.then((data) => {
		if (data.ok) {
			entities = data.value.entities;
			rules = writable(entities.find((e) => e.data.name === 'rules'));
			norms = writable(entities.find((e) => e.data.name === 'norms'));
		}
	});

	const createEntity = async (text: string, name: string) => {
		const content = text.trim(); // TODO parse to trim? regularize step?

		if (!content) return;
		await dispatch.CreateEntity({
			actor: $persona.persona_id,
			data: {type: 'Article', content, name},
			ties: [{source_id: $space.directory_id}],
		});
	};

	$: if (entities) {
		const result = entities.filter((e) => e.data.name === 'rules' || e.data.name === 'norms');
		if (result.length === 0) {
			//TODO initialize these with community, not user persona
			void createEntity(DEFAULT_RULES, 'rules');
			void createEntity(DEFAULT_NORMS, 'norms');
		}
	}

	let newcomer = false;
</script>

<label>
	<input type="checkbox" bind:checked={newcomer} />
	Toggle newcomer view
</label>
{#if newcomer}
	<NewcomerSubmission />
{:else}
	<!--TODO extract stuff below into new component-->
	<div class="home">
		<section class="markup padded-xl">
			<p>
				<strong>
					Check out our community rules and norms!<br />
					Please feel free to voice your thoughts about them. Deliberation is always helpful for maintaining
					a healthy community.
				</strong>
			</p>

			<p>
				You can also check out other communities’ governance structures here (limited to those that
				are public). You can fork other types of governance here.
			</p>
		</section>
		<section class="rules-and-norms">
			<div class="rules markup padded-xl panel">
				<div class="header">
					<h4>rules</h4>
					<!--TODO how to trigger a directory freshen from result of this dialogue-->
					<button
						on:click={() =>
							dispatch.OpenDialog({
								Component: EntityEditor,
								props: {persona, entity: rules},
								dialogProps: {layout: 'page'},
							})}
						>propose change ✍️
					</button>
				</div>
				{#if rules && $rules}<EntityContent entity={rules} />{:else}rules not found{/if}
			</div>
			<div class="norms markup padded-xl panel">
				<div class="header">
					<h4>norms</h4>
					<button
						on:click={() =>
							dispatch.OpenDialog({
								Component: EntityEditor,
								props: {persona, entity: norms},
								dialogProps: {layout: 'page'},
							})}
						>propose change ✍️
					</button>
				</div>
				{#if norms && $norms}<EntityContent entity={norms} />{:else}norms not found{/if}
			</div>
		</section>
		<section class="roles">
			<div class="panel">
				<h2>roles</h2>
				<RolesList />
			</div>
		</section>
		<Forum />
	</div>
{/if}

<style>
	.header {
		display: flex;
		flex-direction: row;
		justify-content: space-around;
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
