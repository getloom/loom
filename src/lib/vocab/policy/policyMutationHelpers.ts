import {Logger} from '@ryanatkn/belt/log.js';
import {writable} from '@getloom/svelte-gettable-stores';

import type {WritableUi} from '$lib/ui/ui.js';
import type {Policy, PolicyId} from '$lib/vocab/policy/policy.js';
import {setIfUpdated} from '$lib/util/store.js';

const log = new Logger('[policyMutationHelpers]');

export const stashPolicies = (
	ui: WritableUi,
	$policiesToStash: Policy[],
	replace = false,
): void => {
	const {policies, policyById} = ui;
	const $policies = policies.get().value;

	if (replace) {
		// TODO do we need to evict the current policies? or should upstream usage handle that?
		policyById.clear();
		policies.mutate((p) => p.clear());
	}

	let mutated = false;
	for (const $policy of $policiesToStash) {
		const {policy_id} = $policy;
		let policy = policyById.get(policy_id);
		if (policy) {
			setIfUpdated(policy, $policy);
		} else {
			policy = writable($policy);
			policyById.set(policy_id, policy);
			$policies.add(policy);
			mutated = true;
		}
	}
	if (mutated) policies.mutate();
};

export const evictPolicies = (ui: WritableUi, policyIdsToEvict: PolicyId[]): void => {
	const {policies, policyById} = ui;
	const $policies = policies.get().value;
	let mutated = false;
	for (const policy_id of policyIdsToEvict) {
		log.debug('evicting policy', policy_id);
		const policy = policyById.get(policy_id);
		if (!policy) continue;
		policyById.delete(policy_id);
		$policies.delete(policy);
		mutated = true;
	}
	if (mutated) policies.mutate();
};
