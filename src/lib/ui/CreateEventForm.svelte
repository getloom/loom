<script lang="ts">
	import PendingButton from '@feltjs/felt-ui/PendingButton.svelte';
	import Message from '@feltjs/felt-ui/Message.svelte';
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import {getApp} from '$lib/ui/app';
	import type {AccountPersona} from '$lib/vocab/actor/persona';
	import CreateEventParamsFields from '$lib/ui/CreateEventParamsFields.svelte';
	import {eventInfos} from '$lib/app/events';
	import type {EventInfo} from '$lib/vocab/event/event';

	const {actions} = getApp();

	export let persona: Readable<AccountPersona>;
	export let done: (() => void) | undefined = undefined;

	let pending = false;
	let errorMessage: string | null = null;

	let formParams: any = null;

	let actionHistory: ActionHistoryItem[] = [];
	interface ActionHistoryItem {
		name: string;
		params: any; // TODO ?
		eventInfo: EventInfo;
		created: number;
		responded: number;
		elapsed: number;
		error: string | null;
	}

	const actionsEvent = async (eventInfo: EventInfo, params: any): Promise<void> => {
		if (pending) return;
		// TODO confirmation dialog!
		formParams = params; // depending on where the event is actionHistory, the form params may not match, but we want to load the form with whatever was just sent for UX purposes
		pending = true;
		errorMessage = null;
		const d: ActionHistoryItem = {
			name: eventInfo.name,
			params,
			eventInfo,
			created: performance.now(),
			responded: 0,
			elapsed: 0,
			error: null,
		};
		const result = await (actions as any)[eventInfo.name](params);
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

	let selectedEventInfo: EventInfo | undefined;

	$: selectedEventInfo, (formParams = null); // TODO should this be needed?

	$: paramsProperties = selectedEventInfo?.params?.properties;
	$: paramsPropertiesKeys = paramsProperties && Object.keys(paramsProperties);
</script>

<form {...$$restProps} class="padded-xl">
	<h2>Create a System Event</h2>
	<div class="layout">
		<fieldset class="events markup">
			<legend>available events</legend>
			{#each eventInfos as eventInfo (eventInfo)}
				<label class="row">
					<input type="radio" bind:group={selectedEventInfo} value={eventInfo} />
					<code class={eventInfo.type}>{eventInfo.name}</code>
				</label>
			{/each}
		</fieldset>
		<div class="content">
			{#if selectedEventInfo}
				<div class="markup">
					<h3>
						<code class={selectedEventInfo.type}>{selectedEventInfo.name}</code><small
							>{selectedEventInfo.type}</small
						>
					</h3>
				</div>
				<div class="params-wrapper">
					{#if paramsPropertiesKeys?.length}
						<fieldset>
							<legend>params</legend>
							<code class="params"><pre>{JSON.stringify(formParams, null, 2)}</pre></code>
							<CreateEventParamsFields
								{persona}
								eventInfo={selectedEventInfo}
								bind:params={formParams}
							/>
						</fieldset>
					{/if}
					<!-- TODO `style="width: 100%"` is a hack -->
					<PendingButton
						on:click={() => selectedEventInfo && actionsEvent(selectedEventInfo, formParams)}
						style="width: 100%"
						{pending}
						disabled={pending}
					>
						actions <code class={selectedEventInfo.type}>{selectedEventInfo.name}</code>
					</PendingButton>
					<!-- TODO implement saving events like any other data to a path/entity -->
					<!-- <PendingButton on:click={save} pending={savePending} disabled={pending}
					>save event</PendingButton
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
					<thead><th>event</th><th>time</th><th /><th>props</th><th>error</th></thead>
					<tbody>
						{#each actionHistory as item (item)}
							<tr>
								<td><code class={item.eventInfo.type}>{item.name}</code></td>
								<td>{Math.round(item.elapsed)}ms</td>
								<td>
									<div class="buttons">
										<button
											class="plain-button icon-button"
											style:--icon_size="var(--icon_size_sm)"
											type="button"
											title="actions {item.eventInfo.name} again"
											on:click={() => actionsEvent(item.eventInfo, item.params)}
										>
											↪
										</button>
										<button
											class="plain-button icon-button"
											style:--icon_size="var(--icon_size_sm)"
											type="button"
											title="actions {item.eventInfo.name} again"
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
		width: var(--column_width);
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
	.events {
		/* TODO maybe take `width: 100%` off .markup? could then delete this */
		width: auto;
	}
	.events label {
		margin-bottom: 0;
	}
	/* TODO copypasted from `PropertyEditor`, maybe extract a class? `.big-text`? */
	.field {
		font-size: var(--font_size_lg);
		font-weight: 700;
	}
	.ServiceEvent {
		color: var(--blue);
	}
	.ClientEvent {
		color: var(--green);
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
