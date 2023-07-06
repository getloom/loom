<script lang="ts">
	import PendingButton from '@feltjs/felt-ui/PendingButton.svelte';
	import Message from '@feltjs/felt-ui/Message.svelte';
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import {getApp} from '$lib/ui/app';
	import type {AccountActor} from '$lib/vocab/actor/actor';
	import CreateActionParamsFields from '$lib/ui/CreateActionParamsFields.svelte';
	import {actionDatas} from '$lib/vocab/action/actionData';
	import type {ActionData} from '$lib/vocab/action/action';

	const {actions} = getApp();

	export let actor: Readable<AccountActor>;
	export let selectedActionData: ActionData | undefined = undefined;
	export let done: (() => void) | undefined = undefined;

	let pending = false;
	let errorMessage: string | null = null;

	let formParams: any = null;

	let actionHistory: ActionHistoryItem[] = [];
	interface ActionHistoryItem {
		name: string;
		params: any; // TODO ?
		actionData: ActionData;
		created: number;
		responded: number;
		elapsed: number;
		error: string | null;
	}

	const actionsEvent = async (actionData: ActionData, params: any): Promise<void> => {
		if (pending) return;
		// TODO confirmation dialog!
		formParams = params; // depending on where the action is actionHistory, the form params may not match, but we want to load the form with whatever was just sent for UX purposes
		pending = true;
		errorMessage = null;
		const d: ActionHistoryItem = {
			name: actionData.name,
			params,
			actionData,
			created: performance.now(),
			responded: 0,
			elapsed: 0,
			error: null,
		};
		const result = await (actions as any)[actionData.name](params);
		pending = false;
		if (result && 'ok' in result) {
			if (result.ok) {
				errorMessage = null;
				done?.();
			} else {
				errorMessage = d.error = result.message;
			}
		}
		d.responded = performance.now();
		d.elapsed = d.responded - d.created;
		actionHistory = [d].concat(actionHistory); // TODO granularly update `responded`/`elapsed` updates so we see it immediately, maybe track `status` and `error` even
	};

	$: selectedActionData, (formParams = null); // TODO should this be needed?

	$: paramsProperties = selectedActionData?.params?.properties;
	$: paramsPropertiesKeys = paramsProperties && Object.keys(paramsProperties);
</script>

<form {...$$restProps} class="padded_xl">
	<div class="prose">
		<h2>Create an Action</h2>
	</div>
	<div class="layout">
		<fieldset class="actions prose">
			<legend>available actions</legend>
			{#each actionDatas as actionData (actionData)}
				<label class="row">
					<input type="radio" bind:group={selectedActionData} value={actionData} />
					<code class={actionData.type}>{actionData.name}</code>
				</label>
			{/each}
		</fieldset>
		<div class="content">
			{#if selectedActionData}
				<div class="prose">
					<h3>
						<code class={selectedActionData.type}>{selectedActionData.name}</code><small
							>{selectedActionData.type}</small
						>
					</h3>
				</div>
				<div class="params-wrapper">
					{#if paramsPropertiesKeys?.length}
						<fieldset>
							<legend>params</legend>
							<code class="params"><pre>{JSON.stringify(formParams, null, 2)}</pre></code>
							<CreateActionParamsFields
								{actor}
								actionData={selectedActionData}
								bind:params={formParams}
							/>
						</fieldset>
					{/if}
					<!-- TODO `style="width: 100%"` is a hack -->
					<PendingButton
						on:click={() => selectedActionData && actionsEvent(selectedActionData, formParams)}
						style="width: 100%"
						{pending}
						disabled={pending}
					>
						perform action&nbsp;<code class={selectedActionData.type}
							>{selectedActionData.name}</code
						>
					</PendingButton>
					<!-- TODO implement saving actions like any other data to a path/entity -->
					<!-- <PendingButton on:click={save} pending={savePending} disabled={pending}
					>save action</PendingButton
				> -->
					{#if errorMessage}
						<div class="error-message">
							<Message status="error">{errorMessage}</Message>
						</div>
					{/if}
				</div>
			{/if}
			{#if actionHistory.length}
				<!-- TODO extract table component with sortable headings -->
				<table class="panel">
					<thead><th>action</th><th>time</th><th /><th>props</th><th>error</th></thead>
					<tbody>
						{#each actionHistory as item (item)}
							<tr>
								<td><code class={item.actionData.type}>{item.name}</code></td>
								<td>{Math.round(item.elapsed)}ms</td>
								<td>
									<div class="buttons">
										<button
											class="plain icon_button"
											style:--icon_size="var(--icon_size_sm)"
											type="button"
											title="actions {item.actionData.name} again"
											on:click={() => actionsEvent(item.actionData, item.params)}
										>
											↪
										</button>
										<button
											class="plain icon_button"
											style:--icon_size="var(--icon_size_sm)"
											type="button"
											title="actions {item.actionData.name} again"
											on:click={() => (actionHistory = actionHistory.filter((d) => d !== item))}
										>
											✕
										</button>
									</div>
								</td>
								<td><code class="ellipsis">{JSON.stringify(item.params)}</code></td>
								<td
									>{#if item.error}<small class="error-text ellipsis" title={item.error}
											>{item.error}</small
										>{/if}</td
								>
							</tr>
						{/each}
					</tbody>
				</table>
				<button type="button" on:click={() => (actionHistory = [])}>clear history</button>
			{/if}
		</div>
	</div>
</form>

<style>
	form {
		width: var(--width_md);
	}
	.layout {
		display: flex;
		align-items: flex-start;
	}
	h3 {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.content {
		position: sticky;
		top: 0;
		padding-left: var(--spacing_xl3);
		flex: 1;
	}
	.actions {
		/* TODO maybe take `width: 100%` off .prose? could then delete this */
		width: auto;
	}
	.actions label {
		margin-bottom: 0;
	}
	/* TODO copypasted from `PropertyEditor`, maybe extract a class? `.big-text`? */
	.field {
		font-size: var(--size_lg);
		font-weight: 700;
	}
	.ServiceAction {
		color: var(--color_1);
	}
	.ClientAction {
		color: var(--color_2);
	}
	table {
		margin: var(--spacing_xl5) 0 var(--spacing_lg);
	}
	th,
	td {
		padding: 0 var(--spacing_xs);
	}
	/* TODO these are messy */
	.params-wrapper {
		margin: var(--spacing_xl3) 0;
	}
	.params {
		margin-bottom: var(--spacing_lg);
	}
	.error-message {
		margin-top: var(--spacing_lg);
	}
	.error-text,
	code.ellipsis {
		max-width: 150px;
	}
</style>
