import {Logger} from '@feltjs/util/log.js';
import type {WritableUi} from '$lib/ui/ui';
import {writable} from '@feltcoop/svelte-gettable-stores';
import {Mutated} from '$lib/util/Mutated';
import type {Policy} from '$lib/vocab/policy/policy';
import {setIfUpdated} from '$lib/util/store';

const log = new Logger('[policyMutationHelpers]');

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
		$policies.clear();
		mutated.add(policies);
	}

	for (const $policy of $policiesToStash) {
		const {policy_id} = $policy;
		let policy = policyById.get(policy_id);
		if (policy) {
			setIfUpdated(policy, $policy);
		} else {
			policy = writable($policy);
			policyById.set(policy_id, policy);
			$policies.add(policy);
			mutated.add(policies);
		}
	}

	mutated.end('stashPolicies');
};

export const evictPolicies = (
	ui: WritableUi,
	policyIds: number[],
	mutated = new Mutated('evictPolicies'),
): void => {
	const {policies, policyById} = ui;

	for (const policy_id of policyIds) {
		log.trace('evicting policy', policy_id);

		const policy = policyById.get(policy_id);
		if (!policy) continue;

		policyById.delete(policy_id);

		policies.get().value.delete(policy);
		mutated.add(policies);
	}

	mutated.end('evictPolicies');
};
