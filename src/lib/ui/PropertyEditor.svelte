<script lang="ts">
	import Message from '@feltcoop/felt/Message.svelte';
	import {identity} from '@feltcoop/util/function.js';
	import type {Result} from '@feltcoop/util';
	import PendingButton from '@feltcoop/felt/PendingButton.svelte';
	import {afterUpdate} from 'svelte';

	import {autofocus} from '$lib/ui/actions';
	import ConfirmDialog from '$lib/ui/ConfirmDialog.svelte';
	import {getApp} from '$lib/ui/app';

	// TODO make this work with other kinds of inputs, starting with numbers

	const {dispatch} = getApp();

	type TValue = $$Generic;

	export let value: TValue;
	export let field: string;
	export let update:
		| ((updated: TValue, field: string) => Promise<Result<unknown, {message: string}>>)
		| null = null;
	export let parse: (serialized: string) => Result<{value: TValue}, {message: string}> = (
		serialized,
	) => ({ok: true, value: serialized as any}); // TODO consider extracting an `ok` helper
	export let serialize: (value: TValue, print?: boolean) => string = identity as any; // TODO type
	export let deletable = false;

	let editing = false;

	let fieldValue: any; // initialized by `reset`
	let serialized: string | undefined;
	$: {
		const parsed = parse(fieldValue);
		if (parsed.ok) {
			serialized = serialize(parsed.value, true);
			errorMessage = null;
		} else {
			serialized = '';
			errorMessage = parsed.message;
		}
	}
	let pending = false;
	let fieldValueEl: HTMLTextAreaElement;
	let shouldFocusEl = false;
	let errorMessage: string | null = null;

	const reset = () => {
		fieldValue = serialize(value);
	};
	reset();

	const edit = () => {
		editing = true;
		shouldFocusEl = true;
	};
	const stopEditing = () => {
		editing = false;
	};

	afterUpdate(() => {
		if (shouldFocusEl) {
			shouldFocusEl = false;
			if (editing) fieldValueEl.focus(); // in case it somehow stopped editing in between
		}
	});

	const save = async () => {
		if (!update) return;
		errorMessage = null;
		const parsed = parse(fieldValue);
		if (!parsed.ok) {
			errorMessage = parsed.message;
			return;
		}
		pending = true;
		const result = await update(parsed.value, field);
		pending = false;
		if (result.ok) {
			stopEditing();
		} else {
			errorMessage = result.message;
		}
	};

	const onKeydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			await save();
		}
	};

	const deleteField = () => {
		dispatch.OpenDialog({
			Component: ConfirmDialog,
			props: {
				action: async () => {
					fieldValue = undefined;
					await save();
				},
				promptText: `Delete '${field}' from this entity? The data will be lost.`,
				confirmText: `delete '${field}' property`,
			},
		});
	};

	$: currentSerialized = serialize(value, true);
	$: changed = serialized !== currentSerialized;
</script>

<div class="field">{field}</div>
<div class="preview markup panel">
	{#if value === undefined}
		<em>undefined</em>
		<!-- TODO add a button to add/instantiate the field with some value -->
	{:else}
		<pre>{currentSerialized}</pre>
	{/if}
</div>
{#if update}
	{#if editing}
		<button type="button" on:click={stopEditing}>cancel</button>
		<textarea
			placeholder="> value"
			bind:this={fieldValueEl}
			bind:value={fieldValue}
			use:autofocus
			disabled={pending}
			on:keydown={onKeydown}
		/>
		{#if changed}
			<div class="buttons">
				<button type="button" on:click={reset}> reset </button>
				<PendingButton on:click={save} {pending} disabled={pending || !!errorMessage}>
					save
				</PendingButton>
			</div>
		{:else if deletable && fieldValue !== undefined}
			<PendingButton on:click={deleteField} {pending} disabled={pending || !!errorMessage}>
				delete property '{field}'
			</PendingButton>
		{/if}
		{#if errorMessage}
			<Message status="error">{errorMessage}</Message>
		{:else if changed}
			<div class="preview markup panel">
				<p>
					{#if fieldValue}<pre>{serialized}</pre>{:else}<em>(empty)</em>{/if}
				</p>
			</div>
		{/if}
	{:else}
		<button type="button" on:click={edit}>edit</button>
	{/if}
{/if}

<style>
	.field {
		font-size: var(--font_size_lg);
		font-weight: 700;
	}
	.preview {
		overflow: auto;
		padding: var(--spacing_xl);
	}
	textarea {
		/* TODO customize this for different values */
		height: 120px;
	}
	pre {
		white-space: pre-wrap;
	}
</style>
