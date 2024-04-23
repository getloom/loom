<script lang="ts">
	import {slide} from 'svelte/transition';
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {identity} from '@ryanatkn/belt/function.js';
	import type {Result} from '@ryanatkn/belt/result.js';
	import {createEventDispatcher} from 'svelte';
	import {to_dialog_params} from '@ryanatkn/fuz/dialog.js';

	import type {AccountActor} from '$lib/vocab/actor/actor.js';
	import {getApp} from '$lib/ui/app.js';
	import HubPicker from '$lib/ui/HubPicker.svelte';
	import HubAvatar from '$lib/ui/HubAvatar.svelte';

	// TODO have an API to click-to-pick for even string values (with a button for more) for things like strings (like actor names, space names, etc, from templates or random)
	// TODO pick hub and the others
	// TODO optional properties

	const dispatch = createEventDispatcher<{pick: TValue | undefined}>(); // eslint-disable-line @typescript-eslint/no-redundant-type-constituents

	const {
		actions,
		ui: {hubById},
	} = getApp();

	type TValue = $$Generic;

	type ParsedValue = Result<{value: TValue}, {message: string}>;
	interface ParseValue {
		(serialized: string): ParsedValue;
	}

	export let actor: Readable<AccountActor>;
	export let value: TValue; // TODO is not reactive, only the initial value is used because otherwise failed parsing clobbers the input value, how to fix?
	export let field: string;
	export let parse: ParseValue | undefined = undefined;
	export let serialize: (value: TValue, print?: boolean) => string = identity as any; // TODO type

	// TODO refactor these
	const parseString: (raw: string) => Result<{value: string}, {message: string}> = (raw) => {
		return {ok: true, value: typeof raw === 'string' ? raw : raw + ''};
	};
	const parseId: (raw: string) => Result<{value: number}, {message: string}> = (raw) => {
		const value = Number(raw);
		return Number.isNaN(value) || value < 1
			? {ok: false, message: 'value is not a valid id'}
			: {ok: true, value};
	};
	// TODO very hacky, need to use schema info
	$: finalParse = (parse ?? field.endsWith('_id') ? parseId : parseString) as ParseValue;

	let fieldValue = serialize(value);
	let parsed: ParsedValue;
	$: parsed = finalParse(fieldValue);
	$: parsedValue = parsed.ok ? parsed.value : undefined;
	$: serialized = parsed.ok ? serialize(parsed.value as any, true) : '';
	$: errorMessage = parsed.ok ? null : parsed.message;
	let lastParsedValue: TValue | undefined = value; // eslint-disable-line @typescript-eslint/no-redundant-type-constituents
	$: lastParsedValue = value;
	let changed = false;
	$: if (parsedValue !== lastParsedValue) {
		changed = true;
		lastParsedValue = parsedValue;
		dispatch('pick', parsedValue);
	}

	const doneWithPicker = async (value: any) => {
		fieldValue = value;
		actions.CloseDialog();
	};

	// TODO everything referencing `hub_id` and hubs is a hack, this component should be generic
	$: hub = field === 'hub_id' && parsedValue ? hubById.get(parsedValue as any) : null; // eslint-disable-line @typescript-eslint/no-unnecessary-type-assertion
</script>

<div class="field">{field}</div>
<div class="preview panel" style:--icon_size="var(--icon_size_sm)">
	{#if field === 'hub_id' && hub}
		<HubAvatar {actor} {hub} />
	{:else if parsedValue === undefined}
		<em>undefined</em>
		<!-- TODO add a button to add/instantiate the field with some value -->
	{:else}
		<pre>{serialized}</pre>
	{/if}
</div>
<!-- TODO use an `input` for certain kinds of values -- need a generic system that can be configured -->
<textarea placeholder="> value" bind:value={fieldValue} />
<div class="row">
	{#if field === 'hub_id'}
		<button
			type="button"
			on:click={() =>
				actions.OpenDialog(to_dialog_params(HubPicker, {actor, done: doneWithPicker}))}
			class="spaced_hz"
		>
			pick hub
		</button>
	{/if}
	{#if errorMessage && changed}
		<div transition:slide class="error_text">{errorMessage}</div>
	{/if}
</div>

<style>
	.field {
		font-size: var(--size_lg);
		font-weight: 700;
	}
	.preview {
		overflow: auto;
		padding: var(--spacing_sm);
		display: flex;
		align-items: center;
		height: 48px; /* TODO this is a hack, can't use `--icon_size` because it's being set above */
	}
	textarea {
		/* TODO customize this for different values */
		height: var(--input_height);
	}
	pre {
		white-space: pre-wrap;
	}
</style>
