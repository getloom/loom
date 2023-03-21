import type {Mutations} from '$lib/app/actionTypes';
import {evictPolicies, stashPolicies} from '$lib/vocab/policy/policyMutationHelpers';

export const CreatePolicy: Mutations['CreatePolicy'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {policy} = result.value;
	ui.mutate(() => stashPolicies(ui, [policy]));
	return result;
};

export const DeletePolicy: Mutations['DeletePolicy'] = async ({params, invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const policy = ui.policyById.get(params.policy_id);
	if (policy) {
		ui.mutate(() => evictPolicies(ui, [policy.get().policy_id]));
	}
	return result;
};
