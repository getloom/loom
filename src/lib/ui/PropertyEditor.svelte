<script lang="ts">
	import {slide} from 'svelte/transition';
	import Alert from '@fuz.dev/fuz_library/Alert.svelte';
	import {identity} from '@ryanatkn/belt/function.js';
	import type {Result} from '@ryanatkn/belt/result.js';
	import Pending_Button from '@fuz.dev/fuz_library/Pending_Button.svelte';
	import {afterUpdate} from 'svelte';
	import {to_dialog_params} from '@fuz.dev/fuz_dialog/dialog.js';

	import {autofocus} from '$lib/ui/actions.js';
	import ConfirmDialog from '$lib/ui/ConfirmDialog.svelte';
	import {getApp} from '$lib/ui/app.js';

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
	export let minimal = false;

	let fieldValue: any = serialize(value); // TODO type is off
	let serialized: string | undefined;
	export let editing = false;
	let pending = false;
	let fieldValueEl: HTMLTextAreaElement;
	let shouldFocusEl = false;
	let errorMessage: string | null = null;

	$: parsed = parse(fieldValue);
	$: serialized = parsed.ok ? serialize(parsed.value, true) : '';
	$: errorMessage = parsed.ok ? null : parsed.message;

	const reset = () => {
		actions.OpenDialog(
			to_dialog_params(ConfirmDialog, {
				confirmed: () => {
					fieldValue = serialize(value);
				},
				promptText: `Are you sure you want to reset "${field}"? Your changes will be lost.`,
				confirmText: 'discard changes',
			}),
		);
	};

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
			to_dialog_params(ConfirmDialog, {
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

<div class="field"><slot name="field">{field}</slot></div>
<div class="preview prose panel">
	{#if currentSerialized == null}
		<em>{currentSerialized}</em>
		<!-- TODO add a button to add/instantiate the field with some value -->
	{:else}
		<pre>{currentSerialized}</pre>
	{/if}
</div>
{#if update}
	{#if !minimal}
		<button type="button" on:click={editing ? stopEditing : edit}>
			{#if editing}cancel{:else}edit{/if}
		</button>
	{/if}
	{#if editing}
		<div transition:slide>
			<textarea
				placeholder="> value"
				bind:this={fieldValueEl}
				bind:value={fieldValue}
				use:autofocus
				disabled={pending}
			/>
			{#if changed}
				<!-- TODO a11y -->
				<div transition:slide>
					<div class="buttons">
						<button type="button" on:click={reset}> reset </button>
						<Pending_Button on:click={save} {pending} disabled={pending || !!errorMessage}>
							save
						</Pending_Button>
					</div>
					{#if !errorMessage}
						<div class="preview prose panel">
							<p>
								{#if fieldValue}<pre>{serialized}</pre>{:else}<em>(empty)</em>{/if}
							</p>
						</div>
					{/if}
				</div>
			{:else if deletable && fieldValue !== undefined}
				<Pending_Button on:click={deleteField} {pending} disabled={pending || !!errorMessage}>
					delete property '{field}'
				</Pending_Button>
			{/if}
			{#if errorMessage}
				<Alert status="error">{errorMessage}</Alert>
			{/if}
		</div>
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
