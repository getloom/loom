import type {Mutations} from '$lib/vocab/action/actionTypes';
import {evictPolicies, stashPolicies} from '$lib/vocab/policy/policyMutationHelpers';

export const CreatePolicy: Mutations['CreatePolicy'] = async ({invoke, mutate, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {policy} = result.value;
	mutate(() => stashPolicies(ui, [policy]));
	return result;
};

export const DeletePolicy: Mutations['DeletePolicy'] = async ({params, invoke, mutate, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const policy = ui.policyById.get(params.policy_id);
	if (policy) {
		mutate(() => evictPolicies(ui, [policy.get().policy_id]));
	}
	return result;
};
