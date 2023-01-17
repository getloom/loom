<script lang="ts">
	import type {AsyncStatus} from '@feltcoop/util/async.js';
	import Message from '@feltcoop/felt/Message.svelte';
	import PendingButton from '@feltcoop/felt/PendingButton.svelte';
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import {autofocus} from '$lib/ui/actions';
	import {getApp} from '$lib/ui/app';
	import ContextInfo from '$lib/ui/ContextInfo.svelte';
	import type {Community} from '$lib/vocab/community/community';
	import type {AccountPersona} from '$lib/vocab/persona/persona';
	import type {Space} from '$lib/vocab/space/space';
	import type {BaseEntityData, EntityData} from '$lib/vocab/entity/entityData';

	const {dispatch} = getApp();

	export let done: (() => void) | undefined = undefined;
	export let entityName = 'Entity';
	export let persona: Readable<AccountPersona>;
	export let community: Readable<Community>;
	export let space: Readable<Space>;
	export let type = 'Collection';
	export let fields: {name?: boolean; content?: boolean} = {content: true}; // TODO add customization like display names for each field

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
			actor: $persona.persona_id,
			space_id: $space.space_id,
			data: data as EntityData, // TODO avoid typecast, probably validation against type?
			ties: [{source_id: $space.directory_id}],
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

<form class="markup padded-xl" {...$$restProps}>
	<slot name="header">
		<h2>Create a new {entityName}</h2>
		<ContextInfo {persona} {community} {space} />
	</slot>
	<fieldset>
		{#if fields.name}
			<label>
				<div class="title">name</div>
				<input
					placeholder=">"
					bind:this={nameEl}
					bind:value={name}
					use:autofocus
					disabled={status === 'pending'}
					on:keydown={onKeydown}
				/>
			</label>
		{/if}
		{#if fields.content}
			<label>
				<div class="title"><slot name="content_title">content</slot></div>
				<textarea
					placeholder=">"
					bind:this={contentEl}
					bind:value={content}
					disabled={status === 'pending'}
					on:keydown={onKeydown}
				/>
			</label>
		{/if}
		<slot name="error" {errorMessage}>
			{#if errorMessage}
				<Message status="error">{errorMessage}</Message>
			{/if}
		</slot>
		<PendingButton on:click={create} pending={status === 'pending'}
			>create {entityName.toLowerCase()}</PendingButton
		>
	</fieldset>
</form>
