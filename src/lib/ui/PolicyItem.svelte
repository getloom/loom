<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import type {AccountActor} from '$lib/vocab/actor/actor';
	import type {Policy} from '$lib/vocab/policy/policy';
	import {getApp} from '$lib/ui/app';
	import type {Role} from '$lib/vocab/role/role';

	const {actions} = getApp();

	export let actor: Readable<AccountActor>;
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
			await actions.DeletePolicy({
				actor: $actor.actor_id,
				policy_id: $policy!.policy_id,
			});
		} else {
			await actions.CreatePolicy({
				actor: $actor.actor_id,
				role_id: $role.role_id,
				permission,
			});
		}
		pending = false;
	};
</script>

<li>
	<label class="row">
		<input type="checkbox" disabled={pending} bind:checked />
		{permission}
	</label>
</li>
