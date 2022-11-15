<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {format} from 'date-fns';

	import PropertyEditor from '$lib/ui/PropertyEditor.svelte';
	import type {Space} from '$lib/vocab/space/space';
	import type {Community} from '$lib/vocab/community/community';
	import {getApp} from '$lib/ui/app';
	import {parseSpaceIcon} from '$lib/vocab/space/spaceHelpers';
	import ContextInfo from '$lib/ui/ContextInfo.svelte';
	import DeleteSpaceForm from '$lib/ui/DeleteSpaceForm.svelte';
	import type {AccountPersona} from '$lib/vocab/persona/persona';

	export let persona: Readable<AccountPersona>;
	export let space: Readable<Space>;
	export let community: Readable<Community>;
	export let done: (() => void) | undefined = undefined;

	const {dispatch, devmode} = getApp();

	const updateSpace = async (updated: any, field: string) =>
		dispatch.UpdateSpace({
			actor: $persona.persona_id,
			space_id: $space.space_id,
			[field]: updated,
		});
</script>

<div class="space-editor column">
	<form>
		<legend>Edit Space</legend>
		<ContextInfo {persona} {community} {space} />
		<section>
			<p>created {format($space.created, 'PPPPp')}</p>
			{#if $space.updated !== null}
				<p>updated {format($space.updated, 'PPPPp')}</p>
			{/if}
		</section>
		<fieldset>
			<ul>
				<li>
					<PropertyEditor value={$space.name} field="name" update={updateSpace} />
				</li>
				<li>
					<PropertyEditor value={$space.url} field="url" update={updateSpace} />
				</li>
				<li>
					<PropertyEditor
						value={$space.icon}
						field="icon"
						update={updateSpace}
						parse={parseSpaceIcon}
					/>
				</li>
				<li>
					<PropertyEditor value={$space.view} field="view" update={updateSpace} />
				</li>
			</ul>
		</fieldset>
		<fieldset>
			<button
				title="delete space"
				on:click={() =>
					dispatch.OpenDialog({
						Component: DeleteSpaceForm,
						props: {
							persona,
							community,
							space,
							done: () => {
								dispatch.CloseDialog();
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
	form li {
		flex-direction: column;
		padding: var(--spacing_xl) 0;
	}
</style>
