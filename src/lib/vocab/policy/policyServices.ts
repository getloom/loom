import {Logger} from '@feltjs/util/log.js';

import {blue, gray} from '$lib/server/colors';
import type {ServiceByName} from '$lib/vocab/action/actionTypes';
import {
	CreatePolicy,
	ReadPolicies,
	UpdatePolicy,
	DeletePolicy,
} from '$lib/vocab/policy/policyActions';
import {checkHubAccess, checkPolicy} from '$lib/vocab/policy/policyHelpers.server';
import {permissions} from '$lib/vocab/policy/permissions';
import {HUB_COLUMNS} from '$lib/vocab/hub/hubHelpers.server';

const log = new Logger(gray('[') + blue('policyServices') + gray(']'));

export const CreatePolicyService: ServiceByName['CreatePolicy'] = {
	action: CreatePolicy,
	transaction: true,
	perform: async ({repos, params}) => {
		const {actor, role_id, permission} = params;

		const {hub_id} = await repos.role.findById(role_id);
		await checkPolicy(permissions.CreatePolicy, actor, hub_id, repos);

		log.debug('creating policy', role_id, permission);
		const policy = await repos.policy.create(role_id, permission);
		return {ok: true, status: 200, value: {policy}};
	},
};

export const ReadPoliciesService: ServiceByName['ReadPolicies'] = {
	action: ReadPolicies,
	transaction: false,
	perform: async ({repos, params}) => {
		const {actor, role_id} = params;
		const hub = await repos.hub.findByRole(role_id, HUB_COLUMNS.hub_id);
		if (!hub) return {ok: false, status: 404, message: 'no hub found'};
		await checkHubAccess(actor, hub.hub_id, repos);

		log.debug('retrieving policies for role', role_id);
		const policies = await repos.policy.filterByRole(role_id);
		return {ok: true, status: 200, value: {policies}};
	},
};

export const UpdatePolicyService: ServiceByName['UpdatePolicy'] = {
	action: UpdatePolicy,
	transaction: true,
	perform: async ({repos, params}) => {
		const {actor, policy_id, data} = params;

		const {hub_id} = await repos.role.findByPolicy(policy_id);
		await checkPolicy(permissions.UpdatePolicy, actor, hub_id, repos);

		log.debug('updating role', policy_id, data);
		const policy = await repos.policy.update(policy_id, data);
		return {ok: true, status: 200, value: {policy}};
	},
};

export const DeletePolicyService: ServiceByName['DeletePolicy'] = {
	action: DeletePolicy,
	transaction: true,
	perform: async ({repos, params}) => {
		const {actor, policy_id} = params;

		const {hub_id} = await repos.role.findByPolicy(policy_id);
		await checkPolicy(permissions.DeletePolicy, actor, hub_id, repos);

		log.debug('deleting policy', policy_id);
		await repos.policy.deleteById(policy_id);

		return {ok: true, status: 200, value: null};
	},
};
