import {Logger} from '@feltcoop/util/log.js';
import {unwrap} from '@feltcoop/util';

import {blue, gray} from '$lib/server/colors';
import type {ServiceByName} from '$lib/app/eventTypes';
import {
	CreatePolicy,
	ReadPolicies,
	UpdatePolicy,
	DeletePolicy,
} from '$lib/vocab/policy/policyEvents';

const log = new Logger(gray('[') + blue('policyServices') + gray(']'));

export const CreatePolicyService: ServiceByName['CreatePolicy'] = {
	event: CreatePolicy,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			const {role_id, permission} = params;
			log.trace('creating policy', role_id, permission);
			const policy = unwrap(await repos.policy.createPolicy(role_id, permission));
			return {ok: true, status: 200, value: {policy}};
		}),
};

export const ReadPoliciesService: ServiceByName['ReadPolicies'] = {
	event: ReadPolicies,
	perform: async ({repos, params}) => {
		const {role_id} = params;
		log.trace('retrieving policies for role', role_id);
		const policies = unwrap(await repos.policy.filterByRoleId(role_id));
		return {ok: true, status: 200, value: {policies}};
	},
};

export const UpdatePolicyService: ServiceByName['UpdatePolicy'] = {
	event: UpdatePolicy,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			const {policy_id, data} = params;
			log.trace('updating role', policy_id, data);
			const policy = unwrap(await repos.policy.updatePolicy(policy_id, data));
			return {ok: true, status: 200, value: {policy}};
		}),
};

export const DeletePolicyService: ServiceByName['DeletePolicy'] = {
	event: DeletePolicy,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			const {policy_id} = params;
			log.trace('deleting policy', policy_id);

			unwrap(await repos.policy.deleteById(policy_id));

			return {ok: true, status: 200, value: null};
		}),
};