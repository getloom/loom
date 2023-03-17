<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {format} from 'date-fns';

	import {getApp} from '$lib/ui/app';
	import {parseJson, serializeJson} from '$lib/util/json';
	import PropertyEditor from '$lib/ui/PropertyEditor.svelte';
	import type {Account} from '$lib/vocab/account/account';
	import UpdateAccountPasswordForm from '$lib/ui/UpdateAccountPasswordForm.svelte';

	export let account: Readable<Account>;

	const {actions} = getApp();

	const updateAccountSettings = async (updated: any) =>
		actions.UpdateAccountSettings({
			settings: updated,
		});
</script>

<div class="entity-editor column">
	<div class="markup padded-xl">
		<h2>Account settings</h2>
		<section>
			<div style:font-size="var(--font_size_xl)">{$account.name}</div>
			<div>created {format($account.created, 'PPPPp')}</div>
			{#if $account.updated !== null}
				<div>updated {format($account.updated, 'PPPPp')}</div>
			{/if}
		</section>
	</div>
	<UpdateAccountPasswordForm />
	<!-- TODO add entity property contextmenu actions to this -->
	<form>
		<fieldset>
			<PropertyEditor
				value={$account.settings}
				field="settings"
				update={updateAccountSettings}
				parse={parseJson}
				serialize={serializeJson}
			/>
		</fieldset>
	</form>
</div>

<style>
	.entity-editor {
		padding: var(--spacing_xl);
	}
</style>
