<script lang="ts">
	import {getApp} from '$lib/ui/app.js';
	import {getSpaceContext} from '$lib/vocab/view/view.js';
	import {parseJson, serializeJson} from '$lib/util/json.js';
	import PropertyEditor from '$lib/ui/PropertyEditor.svelte';
	import Alert from '@ryanatkn/fuz/Alert.svelte';
	import {ADMIN_HUB_ID} from '$lib/util/constants.js';

	const {actor, hub} = getSpaceContext();
	const {actions} = getApp();

	$: instanceSettings = $hub.settings.instance;

	const updateHubSetting = async (updated: any, field: string) =>
		actions.UpdateHub({
			actor: $actor.actor_id,
			hub_id: $hub.hub_id,
			settings: {...$hub.settings, instance: {...instanceSettings, [field]: updated}},
		});
</script>

<div class="prose padded_1">
	<h1>instance admin</h1>
	{#if $hub.hub_id === ADMIN_HUB_ID}
		<fieldset>
			<legend>settings</legend>
			<!--TODO generically populate based on attribue keys/schema?-->
			<Alert
				>to allow any name, delete this setting; otherwise only strings in this array will be
				allowed for account creation</Alert
			>
			<PropertyEditor
				value={instanceSettings?.allowedAccountNames}
				field="allowedAccountNames"
				update={updateHubSetting}
				deletable={true}
				parse={parseJson}
				serialize={serializeJson}
			/>
			<PropertyEditor
				value={instanceSettings?.defaultHubIds}
				field="defaultHubIds"
				update={updateHubSetting}
				deletable={true}
				parse={parseJson}
				serialize={serializeJson}
			/>
			<PropertyEditor
				value={instanceSettings?.disableSignups}
				field="disableSignups"
				update={updateHubSetting}
				deletable={true}
				parse={parseJson}
				serialize={serializeJson}
			/>
			<PropertyEditor
				value={instanceSettings?.enableInviteOnlySignups}
				field="enableInviteOnlySignups"
				update={updateHubSetting}
				deletable={true}
				parse={parseJson}
				serialize={serializeJson}
			/>
			<PropertyEditor
				value={instanceSettings?.disableCreateHub}
				field="disableCreateHub"
				update={updateHubSetting}
				deletable={true}
				parse={parseJson}
				serialize={serializeJson}
			/>
			<Alert>
				when hub creation is disabled, only admins are allowed to create hubs. Names added to this
				list will be granted an exception to this rule.
			</Alert>
			<PropertyEditor
				value={instanceSettings?.allowedHubCreationAccounts}
				field="allowedHubCreationAccounts"
				update={updateHubSetting}
				deletable={true}
				parse={parseJson}
				serialize={serializeJson}
			/>
			<PropertyEditor
				value={instanceSettings?.minPasswordLength}
				field="minPasswordLength"
				update={updateHubSetting}
				deletable={false}
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
