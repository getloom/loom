<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import {getApp} from '$lib/ui/app';
	import {parseJson, serializeJson} from '$lib/util/json';
	import PropertyEditor from '$lib/ui/PropertyEditor.svelte';
	import type {Hub} from '$lib/vocab/hub/hub';
	import type {AccountPersona} from '$lib/vocab/persona/persona';

	export let actor: Readable<AccountPersona>;
	export let hub: Readable<Hub>;

	const {actions} = getApp();

	const updateHubSettings = async (updated: any) =>
		actions.UpdateHubSettings({
			actor: $actor.persona_id,
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
