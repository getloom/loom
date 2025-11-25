import {Logger} from '@ryanatkn/belt/log.js';

import {blue, gray} from 'kleur/colors';
import type {ServiceByName} from '$lib/vocab/action/actionTypes.js';
import {
	CreatePolicy,
	ReadPolicies,
	UpdatePolicy,
	DeletePolicy,
} from '$lib/vocab/policy/policyActions.js';
import {HUB_COLUMNS} from '$lib/vocab/hub/hubHelpers.server.js';

const log = new Logger(gray('[') + blue('policyServices') + gray(']'));

export const CreatePolicyService: ServiceByName['CreatePolicy'] = {
	action: CreatePolicy,
	transaction: true,
	perform: async ({repos, params, checkPolicy}) => {
		const {role_id, name} = params;

		const {hub_id} = await repos.role.findById(role_id);
		await checkPolicy('create_policy', hub_id);

		log.debug('creating policy', role_id, name);
		const policy = await repos.policy.create(role_id, name);
		return {ok: true, status: 200, value: {policy}, broadcast: hub_id};
	},
};

export const ReadPoliciesService: ServiceByName['ReadPolicies'] = {
	action: ReadPolicies,
	transaction: false,
	perform: async ({repos, params, checkHubAccess}) => {
		const {role_id} = params;
		const hub = await repos.hub.findByRole(role_id, HUB_COLUMNS.hub_id);
		if (!hub) return {ok: false, status: 404, message: 'no hub found'};
		await checkHubAccess(hub.hub_id);

		log.debug('retrieving policies for role', role_id);
		const policies = await repos.policy.filterByRole(role_id);
		return {ok: true, status: 200, value: {policies}};
	},
};

export const UpdatePolicyService: ServiceByName['UpdatePolicy'] = {
	action: UpdatePolicy,
	transaction: true,
	perform: async ({repos, params, checkPolicy}) => {
		const {policy_id, data} = params;

		const {hub_id} = await repos.role.findByPolicy(policy_id);
		await checkPolicy('update_policy', hub_id);

		log.debug('updating role', policy_id, data);
		const policy = await repos.policy.update(policy_id, data);
		return {ok: true, status: 200, value: {policy}, broadcast: hub_id};
	},
};

export const DeletePolicyService: ServiceByName['DeletePolicy'] = {
	action: DeletePolicy,
	transaction: true,
	perform: async ({repos, params, checkPolicy}) => {
		const {policy_id} = params;

		const {hub_id} = await repos.role.findByPolicy(policy_id);
		await checkPolicy('delete_policy', hub_id);

		log.debug('deleting policy', policy_id);
		await repos.policy.deleteById(policy_id);

		return {ok: true, status: 200, value: null, broadcast: hub_id};
	},
};
