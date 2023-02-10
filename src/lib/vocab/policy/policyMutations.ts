import type {Mutations} from '$lib/app/eventTypes';
import {evictPolicies, stashPolicies} from '$lib/vocab/policy/policyMutationHelpers';

export const CreatePolicy: Mutations['CreatePolicy'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {policy} = result.value;
	stashPolicies(ui, [policy]);
	return result;
};

export const DeletePolicy: Mutations['DeletePolicy'] = async ({params, invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const policy = ui.policyById.get(params.policy_id);
	if (policy) {
		evictPolicies(ui, [policy.get().policy_id]);
	}
	return result;
};
