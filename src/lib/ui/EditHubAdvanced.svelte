<script lang="ts">
	import type {Readable} from '@getloom/svelte-gettable-stores';

	import {getApp} from '$lib/ui/app.js';
	import {parseJson, serializeJson} from '$lib/util/json.js';
	import PropertyEditor from '$lib/ui/PropertyEditor.svelte';
	import type {Hub} from '$lib/vocab/hub/hub.js';
	import type {AccountActor} from '$lib/vocab/actor/actor.js';

	export let actor: Readable<AccountActor>;
	export let hub: Readable<Hub>;

	const {actions} = getApp();

	const updateHubSettings = async (updated: any) =>
		actions.UpdateHub({
			actor: $actor.actor_id,
			hub_id: $hub.hub_id,
			settings: updated,
		});
</script>

<fieldset>
	<legend>properties</legend>
	<PropertyEditor value={$hub.hub_id} field="hub_id" />
	<PropertyEditor value={$hub.name} field="name" />
	<PropertyEditor value={$hub.type} field="type" />
	<PropertyEditor
		value={$hub.settings}
		field="settings"
		update={updateHubSettings}
		parse={parseJson}
		serialize={serializeJson}
	/>
</fieldset>
