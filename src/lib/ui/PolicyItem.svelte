<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import type {AccountPersona} from '$lib/vocab/persona/persona';
	import type {Policy} from '$lib/vocab/policy/policy';
	import {getApp} from '$lib/ui/app';
	import type {Role} from '$lib/vocab/role/role';

	const {dispatch} = getApp();

	export let actor: Readable<AccountPersona>;
	export let role: Readable<Role>;
	export let permission: string;
	export let policy: Readable<Policy> | undefined;
	let pending = false;

	$: hasPolicy = !!policy;

	$: checked = hasPolicy;

	$: if (checked !== undefined) void togglePolicy();

	const togglePolicy = async () => {
		if (hasPolicy === checked) return;
		pending = true;
		if (policy) {
			await dispatch.DeletePolicy({
				actor: $actor.persona_id,
				policy_id: $policy!.policy_id,
			});
		} else {
			await dispatch.CreatePolicy({
				actor: $actor.persona_id,
				role_id: $role.role_id,
				permission,
			});
		}
		pending = false;
	};
</script>

<div>
	<input type="checkbox" disabled={pending} bind:checked />
	<span>{permission}</span>
</div>
