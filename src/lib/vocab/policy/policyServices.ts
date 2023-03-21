import {Logger} from '@feltjs/util/log.js';
import {unwrap} from '@feltjs/util';

import {blue, gray} from '$lib/server/colors';
import type {ServiceByName} from '$lib/app/actionTypes';
import {
	CreatePolicy,
	ReadPolicies,
	UpdatePolicy,
	DeletePolicy,
} from '$lib/vocab/policy/policyEvents';
import {checkHubAccess, checkPolicy} from '$lib/vocab/policy/policyHelpers.server';
import {permissions} from '$lib/vocab/policy/permissions';

const log = new Logger(gray('[') + blue('policyServices') + gray(']'));

export const CreatePolicyService: ServiceByName['CreatePolicy'] = {
	event: CreatePolicy,
	transaction: true,
	perform: async ({repos, params}) => {
		const {actor, role_id, permission} = params;

		const {hub_id} = unwrap(await repos.role.findById(role_id));
		await checkPolicy(permissions.CreatePolicy, actor, hub_id, repos);

		log.trace('creating policy', role_id, permission);
		const policy = unwrap(await repos.policy.create(role_id, permission));
		return {ok: true, status: 200, value: {policy}};
	},
};

export const ReadPoliciesService: ServiceByName['ReadPolicies'] = {
	event: ReadPolicies,
	transaction: false,
	perform: async ({repos, params}) => {
		const {actor, role_id} = params;
		const hub = unwrap(await repos.hub.findByRole(role_id));
		await checkHubAccess(actor, hub.hub_id, repos);

		log.trace('retrieving policies for role', role_id);
		const policies = unwrap(await repos.policy.filterByRole(role_id));
		return {ok: true, status: 200, value: {policies}};
	},
};

export const UpdatePolicyService: ServiceByName['UpdatePolicy'] = {
	event: UpdatePolicy,
	transaction: true,
	perform: async ({repos, params}) => {
		const {actor, policy_id, data} = params;

		const {hub_id} = unwrap(await repos.role.findByPolicy(policy_id));
		await checkPolicy(permissions.UpdatePolicy, actor, hub_id, repos);

		log.trace('updating role', policy_id, data);
		const policy = unwrap(await repos.policy.update(policy_id, data));
		return {ok: true, status: 200, value: {policy}};
	},
};

export const DeletePolicyService: ServiceByName['DeletePolicy'] = {
	event: DeletePolicy,
	transaction: true,
	perform: async ({repos, params}) => {
		const {actor, policy_id} = params;

		const {hub_id} = unwrap(await repos.role.findByPolicy(policy_id));
		await checkPolicy(permissions.DeletePolicy, actor, hub_id, repos);

		log.trace('deleting policy', policy_id);
		unwrap(await repos.policy.deleteById(policy_id));

		return {ok: true, status: 200, value: null};
	},
};
