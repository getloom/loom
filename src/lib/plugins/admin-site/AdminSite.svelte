<script lang="ts">
	import {getApp} from '$lib/ui/app.js';
	import {getSpaceContext} from '$lib/vocab/view/view.js';
	import {parseJson, serializeJson} from '$lib/util/json.js';
	import PropertyEditor from '$lib/ui/PropertyEditor.svelte';	
	import {ADMIN_HUB_ID} from '$lib/util/constants.js';

	const {actor, hub} = getSpaceContext();
	const {actions} = getApp();

    $: instanceSettings = $hub.settings.instance;
	$: siteSettings = $hub.settings.instance ? $hub.settings.instance.site : undefined;

	const updateHubSetting = async (updated: any, field: string) =>
		actions.UpdateHub({
			actor: $actor.actor_id,
			hub_id: $hub.hub_id,
			settings: {...$hub.settings, instance: {...instanceSettings, site: {...siteSettings, [field]: updated}}}
        });
</script>

<div class="prose padded_1">
	<h1>home site admin</h1>
	{#if $hub.hub_id === ADMIN_HUB_ID}
		<fieldset>
			<legend>settings</legend>			
			<PropertyEditor
				value={siteSettings?.sourceRepo}
				field="sourceRepo"
				update={updateHubSetting}
				deletable={true}
				parse={parseJson}
				serialize={serializeJson}
			/>
		</fieldset>
	{/if}
</div>

<style>
	.prose {
		min-height: 100%;
	}
</style>