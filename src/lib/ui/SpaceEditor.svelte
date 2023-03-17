<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {format} from 'date-fns';

	import PropertyEditor from '$lib/ui/PropertyEditor.svelte';
	import type {Space} from '$lib/vocab/space/space';
	import type {Hub} from '$lib/vocab/hub/hub';
	import {getApp} from '$lib/ui/app';
	import {parseSpaceIcon} from '$lib/vocab/space/spaceHelpers';
	import ContextInfo from '$lib/ui/ContextInfo.svelte';
	import DeleteSpaceForm from '$lib/ui/DeleteSpaceForm.svelte';
	import type {AccountPersona} from '$lib/vocab/persona/persona';

	const {
		actions,
		devmode,
		ui: {entityById},
	} = getApp();

	export let persona: Readable<AccountPersona>;
	export let space: Readable<Space>;
	export let hub: Readable<Hub>;
	export let done: (() => void) | undefined = undefined;

	$: directory = entityById.get($space.directory_id)!;

	const updateSpace = async (updated: any, field: string) =>
		actions.UpdateSpace({
			actor: $persona.persona_id,
			space_id: $space.space_id,
			[field]: updated,
		});
</script>

<div class="space-editor column">
	<form class="markup" {...$$restProps}>
		<header>
			<h2>Edit Space</h2>
			<ContextInfo {persona} {hub} {space} />
			<section>
				<p>created {format($space.created, 'PPPPp')}</p>
				{#if $space.updated !== null}
					<p>updated {format($space.updated, 'PPPPp')}</p>
				{/if}
			</section>
		</header>
		<fieldset>
			<legend>properties</legend>
			<PropertyEditor value={$space.name} field="name" update={updateSpace} />
			<PropertyEditor value={$directory.path} field="path" update={updateSpace} />
			<PropertyEditor
				value={$space.icon}
				field="icon"
				update={updateSpace}
				parse={parseSpaceIcon}
			/>
			<PropertyEditor value={$space.view} field="view" update={updateSpace} />
		</fieldset>
		<fieldset>
			<legend class="error-text">danger! zone</legend>
			<button
				title="delete space"
				on:click={() =>
					actions.OpenDialog({
						Component: DeleteSpaceForm,
						props: {
							persona,
							hub,
							space,
							done: () => {
								actions.CloseDialog();
								done?.();
							},
						},
					})}>delete space</button
			>
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
		padding: var(--spacing_xl);
	}
</style>
