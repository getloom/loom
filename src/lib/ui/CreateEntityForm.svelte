<script lang="ts">
	import type {Async_Status} from '@ryanatkn/belt/async.js';
	import Alert from '@ryanatkn/fuz/Alert.svelte';
	import Pending_Button from '@ryanatkn/fuz/Pending_Button.svelte';
	import type {Readable} from '@getloom/svelte-gettable-stores';

	import {autofocus} from '$lib/ui/actions.js';
	import {getApp} from '$lib/ui/app.js';
	import ContextInfo from '$lib/ui/ContextInfo.svelte';
	import type {Hub} from '$lib/vocab/hub/hub.js';
	import type {AccountActor} from '$lib/vocab/actor/actor.js';
	import type {Space} from '$lib/vocab/space/space.js';
	import type {BaseEntityData, EntityData} from '$lib/vocab/entity/entityData.js';
	import type {Entity} from '$lib/vocab/entity/entity.js';
	import type {CreateEntityParams} from '$lib/vocab/action/actionTypes.js';

	const {actions} = getApp();

	export let done: ((entity?: Entity) => void) | undefined = undefined;
	export let entityName = 'Entity';
	export let actor: Readable<AccountActor>;
	export let hub: Readable<Hub>;
	export let space: Readable<Space>;
	export let type = 'Collection';
	export let ties: CreateEntityParams['ties'] | undefined = undefined;
	export let fields: {name?: boolean; content?: boolean} = {content: true}; // TODO add customization like display names for each field
	export let attrs: any = undefined;

	$: finalTies = ties ?? [{source_id: $space.directory_id}];
	let name = '';
	let content = '';
	let status: Async_Status = 'initial'; // TODO refactor
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
		if (type === 'OrderedCollection') data.orderedItems = [];
		const result = await actions.CreateEntity({
			actor: $actor.actor_id,
			space_id: $space.space_id,
			data: data as EntityData, // TODO avoid typecast, probably validation against type?
			ties: finalTies,
		});
		status = 'success'; // TODO handle failure (also refactor to be generic)
		if (result.ok) {
			errorMessage = null;
			name = '';
			content = '';
			done?.(result.value.entities[0]);
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

<form class="padded_1" {...attrs}>
	{#if $$slots.header}
		<slot name="header">
			<h2>Create a new {entityName}</h2>
			<ContextInfo {actor} {hub} {space} />
		</slot>
	{/if}
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
				<Alert status="error">{errorMessage}</Alert>
			{/if}
		</slot>
		<Pending_Button on:click={create} pending={status === 'pending'}
			>create {entityName.toLowerCase()}</Pending_Button
		>
	</fieldset>
</form>
