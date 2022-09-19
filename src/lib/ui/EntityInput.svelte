<script lang="ts">
	import type {AsyncStatus} from '@feltcoop/felt';
	import Message from '@feltcoop/felt/ui/Message.svelte';
	import PendingButton from '@feltcoop/felt/ui/PendingButton.svelte';
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import {autofocus} from '$lib/ui/actions';
	import {getApp} from '$lib/ui/app';
	import ContextInfo from '$lib/ui/ContextInfo.svelte';
	import type {Community} from '$lib/vocab/community/community';
	import type {Persona} from '$lib/vocab/persona/persona';
	import type {Space} from '$lib/vocab/space/space';
	import type {BaseEntityData, EntityData} from '$lib/vocab/entity/entityData';

	const {
		dispatch,
		ui: {personaSelection, spaceSelection},
	} = getApp();

	export let done: (() => void) | undefined = undefined;
	export let entityName = 'Entity';
	export let persona: Readable<Persona>;
	export let community: Readable<Community>;
	export let space: Readable<Space>;
	export let type = 'Collection';
	export let fields: {name?: boolean; content?: boolean} = {name: true, content: true}; // TODO add customization like display names for each field

	$: selectedPersona = $personaSelection;
	$: persona_id = $selectedPersona!.persona_id;
	$: selectedSpace = $spaceSelection;
	$: source_id = $selectedSpace!.directory_id;

	let name = '';
	let content = '';
	let status: AsyncStatus = 'initial'; // TODO refactor
	let nameEl: HTMLInputElement;
	let contentEl: HTMLTextAreaElement;
	let errorMessage: string | null = null;

	// TODO add initial hue!

	const create = async () => {
		//TODO validate inputs
		name = name.trim();
		content = content.trim();
		if (fields.name && !name) {
			errorMessage = `please enter a name for your new ${entityName}`;
			nameEl.focus();
			return;
		}
		if (fields.content && !content) {
			errorMessage = `please enter content for your new ${entityName}`;
			contentEl.focus();
			return;
		}
		status = 'pending';
		const data: BaseEntityData = {type};
		if (fields.name) data.name = name;
		if (fields.content) data.content = content;
		const result = await dispatch.CreateEntity({
			persona_id,
			data: data as EntityData, // TODO avoid typecast, probably validation against type?
			source_id,
		});
		status = 'success'; // TODO handle failure (also refactor to be generic)
		if (result.ok) {
			errorMessage = null;
			name = '';
			content = '';
			done?.();
		} else {
			errorMessage = result.message;
		}
	};

	const onKeydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			await create();
		}
	};
</script>

<div class="entity-input markup">
	<h1>New {entityName}</h1>
	<ContextInfo {persona} {community} {space} />
	<form>
		{#if fields.name}
			<input
				placeholder="> name"
				bind:this={nameEl}
				bind:value={name}
				use:autofocus
				disabled={status === 'pending'}
				on:keydown={onKeydown}
			/>
		{/if}
		{#if fields.content}
			<textarea
				placeholder="> content"
				bind:this={contentEl}
				bind:value={content}
				disabled={status === 'pending'}
				on:keydown={onKeydown}
			/>
		{/if}
		{#if errorMessage}
			<Message status="error">{errorMessage}</Message>
		{/if}
		<PendingButton on:click={create} pending={status === 'pending'}
			>Create {entityName}</PendingButton
		>
	</form>
</div>

<style>
	.entity-input {
		padding: var(--spacing_xl);
	}
</style>
