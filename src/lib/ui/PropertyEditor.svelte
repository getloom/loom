<script lang="ts">
	import Message from '@feltjs/felt-ui/Message.svelte';
	import {identity} from '@feltjs/util/function.js';
	import type {Result} from '@feltjs/util/result.js';
	import PendingButton from '@feltjs/felt-ui/PendingButton.svelte';
	import {afterUpdate} from 'svelte';
	import {toDialogParams} from '@feltjs/felt-ui/dialog.js';

	import {autofocus} from '$lib/ui/actions';
	import ConfirmDialog from '$lib/ui/ConfirmDialog.svelte';
	import {getApp} from '$lib/ui/app';

	// TODO make this work with other kinds of inputs, starting with numbers

	const {actions} = getApp();

	type TValue = $$Generic;

	export let value: TValue;
	export let field: string;
	export let update:
		| ((updated: TValue, field: string) => void | Promise<Result<unknown, {message: string}>>)
		| null = null;
	export let parse: (serialized: string) => Result<{value: TValue}, {message: string}> = (
		serialized,
	) => ({ok: true, value: serialized as any}); // TODO consider extracting an `ok` helper
	export let serialize: (value: TValue, print?: boolean) => string = identity as any; // TODO type
	export let deletable = false;

	let fieldValue: any; // initialized by `reset`
	let serialized: string | undefined;
	let editing = false;
	let pending = false;
	let fieldValueEl: HTMLTextAreaElement;
	let shouldFocusEl = false;
	let errorMessage: string | null = null;

	$: parsed = parse(fieldValue);
	$: serialized = parsed.ok ? serialize(parsed.value, true) : '';
	$: errorMessage = parsed.ok ? null : parsed.message;

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
		if (!update || !parsed.ok) return;
		errorMessage = null;
		pending = true;
		const result = await update(parsed.value, field);
		pending = false;
		if (result) {
			if (result.ok) {
				stopEditing();
			} else {
				errorMessage = result.message;
				shouldFocusEl = true;
			}
		}
	};

	const deleteField = () => {
		actions.OpenDialog(
			toDialogParams(ConfirmDialog, {
				confirmed: async () => {
					fieldValue = undefined;
					await save();
				},
				promptText: `Delete '${field}' from this entity? The data will be lost.`,
				confirmText: `delete '${field}' property`,
			}),
		);
	};

	$: currentSerialized = serialize(value, true);
	$: changed = serialized !== currentSerialized;
</script>

<div class="field">{field}</div>
<div class="preview prose panel">
	{#if currentSerialized == null}
		<em>{currentSerialized}</em>
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
		/>
		{#if changed}
			<!-- TODO a11y -->
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
			<div class="preview prose panel">
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
		font-size: var(--size_lg);
		font-weight: 700;
	}
	.preview {
		overflow: auto;
		padding: var(--spacing_lg);
	}
	textarea {
		/* TODO customize this for different values */
		height: 120px;
	}
	pre {
		white-space: pre-wrap;
	}
</style>
