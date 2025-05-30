<script lang="ts">
	import type {Readable} from '@getloom/svelte-gettable-stores';
	import {format} from 'date-fns';
	import {to_dialog_params} from '@ryanatkn/fuz/dialog.js';

	import PropertyEditor from '$lib/ui/PropertyEditor.svelte';
	import type {Space} from '$lib/vocab/space/space.js';
	import type {Hub} from '$lib/vocab/hub/hub.js';
	import {getApp} from '$lib/ui/app.js';
	import {parseSpaceIcon} from '$lib/vocab/space/spaceHelpers.js';
	import ContextInfo from '$lib/ui/ContextInfo.svelte';
	import DeleteSpaceForm from '$lib/ui/DeleteSpaceForm.svelte';
	import type {AccountActor} from '$lib/vocab/actor/actor.js';

	const {
		actions,
		devmode,
		ui: {entityById},
	} = getApp();

	export let actor: Readable<AccountActor>;
	export let space: Readable<Space>;
	export let hub: Readable<Hub>;
	export let done: (() => void) | undefined = undefined;
	export let attrs: any = undefined;

	$: directory = entityById.get($space.directory_id)!;

	const updateSpace = async (updated: any, field: string) =>
		actions.UpdateSpace({
			actor: $actor.actor_id,
			space_id: $space.space_id,
			[field]: updated,
		});
</script>

<div class="space-editor width_md">
	<form class="prose" {...attrs}>
		<header>
			<h2>Edit Space</h2>
			<ContextInfo {actor} {hub} {space} />
			<section>
				<p>created {format($space.created, 'PPPPp')}</p>
				{#if $space.updated !== null}
					<p>updated {format($space.updated, 'PPPPp')}</p>
				{/if}
				<p>path: {$directory.path}</p>
			</section>
		</header>
		<fieldset>
			<legend>properties</legend>
			<PropertyEditor value={$space.name} field="name" update={updateSpace} />
			<PropertyEditor
				value={$space.icon}
				field="icon"
				update={updateSpace}
				parse={parseSpaceIcon}
			/>
			<PropertyEditor value={$space.view} field="view" update={updateSpace} />
		</fieldset>
		<fieldset>
			<legend class="error_text">danger zone</legend>
			<button
				title="delete space"
				on:click={() =>
					actions.OpenDialog(
						to_dialog_params(DeleteSpaceForm, {
							actor,
							hub,
							space,
							done: () => {
								actions.CloseDialog();
								done?.();
							},
						}),
					)}
			>
				delete space
			</button>
		</fieldset>
	</form>

	{#if $devmode}
		<hr />
		<section>
			TODO devmode stuff
			<!-- TODO need equivalent that works for spaces -->
			<!-- <EntityTable entity={space} /> -->
		</section>
	{/if}
</div>

<style>
	.space-editor {
		display: flex;
		flex-direction: column;
		padding: var(--spacing_1);
	}
</style>
