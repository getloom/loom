import type {WritableUi} from '$lib/ui/ui';
import {writable} from '@feltcoop/svelte-gettable-stores';
import {Mutated} from '$lib/util/Mutated';
import type {Policy} from '$lib/vocab/policy/policy';

export const stashPolicies = (
	ui: WritableUi,
	$policiesToStash: Policy[],
	mutated = new Mutated('stashPolicies'),
	replace = false,
): void => {
	const {policies, policyById} = ui;
	const $policies = policies.get().value;

	if (replace) {
		// TODO do we need to evict the current policies? or should upstream usage handle that?
		policyById.clear();
		$policies.length = 0;
		mutated.add(policies);
	}

	for (const $policy of $policiesToStash) {
		const {policy_id} = $policy;
		let policy = policyById.get(policy_id);
		if (policy) {
			policy.set($policy);
		} else {
			policy = writable($policy);
			policyById.set(policy_id, policy);
			$policies.push(policy);
			mutated.add(policies);
		}
	}

	mutated.end('stashPolicies');
};
