<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import {getApp} from '$lib/ui/app';
	import {parseJson, serializeJson} from '$lib/util/json';
	import PropertyEditor from '$lib/ui/PropertyEditor.svelte';
	import type {Community} from '$lib/vocab/community/community';
	import type {AccountPersona} from '$lib/vocab/persona/persona';

	export let actor: Readable<AccountPersona>;
	export let community: Readable<Community>;

	const {dispatch} = getApp();

	const updateCommunitySettings = async (updated: any) =>
		dispatch.UpdateCommunitySettings({
			actor: $actor.persona_id,
			community_id: $community.community_id,
			settings: updated,
		});
</script>

<fieldset>
	<legend>properties</legend>
	<PropertyEditor value={$community.community_id} field="community_id" />
	<PropertyEditor value={$community.name} field="name" />
	<PropertyEditor value={$community.type} field="type" />
	<PropertyEditor
		value={$community.settings}
		field="settings"
		update={updateCommunitySettings}
		parse={parseJson}
		serialize={serializeJson}
	/>
</fieldset>
