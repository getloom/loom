import {Logger} from '@feltjs/util/log.js';
import {unwrap} from '@feltjs/util';

import {blue, gray} from '$lib/server/colors';
import type {ServiceByName} from '$lib/app/eventTypes';
import {
	CreatePolicy,
	ReadPolicies,
	UpdatePolicy,
	DeletePolicy,
} from '$lib/vocab/policy/policyEvents';
import {checkCommunityAccess, checkPolicy} from '$lib/vocab/policy/policyHelpers.server';
import {permissions} from '$lib/vocab/policy/permissions';

const log = new Logger(gray('[') + blue('policyServices') + gray(']'));

export const CreatePolicyService: ServiceByName['CreatePolicy'] = {
	event: CreatePolicy,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			const {actor, role_id, permission} = params;

			const {community_id} = unwrap(await repos.role.findById(role_id));
			await checkPolicy(permissions.CreatePolicy, actor, community_id, repos);

			log.trace('creating policy', role_id, permission);
			const policy = unwrap(await repos.policy.create(role_id, permission));
			return {ok: true, status: 200, value: {policy}};
		}),
};

export const ReadPoliciesService: ServiceByName['ReadPolicies'] = {
	event: ReadPolicies,
	perform: async ({repos, params}) => {
		const {actor, role_id} = params;
		const community = unwrap(await repos.community.findByRole(role_id));
		await checkCommunityAccess(actor, community.community_id, repos);

		log.trace('retrieving policies for role', role_id);
		const policies = unwrap(await repos.policy.filterByRole(role_id));
		return {ok: true, status: 200, value: {policies}};
	},
};

export const UpdatePolicyService: ServiceByName['UpdatePolicy'] = {
	event: UpdatePolicy,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			const {actor, policy_id, data} = params;

			const {community_id} = unwrap(await repos.role.findByPolicy(policy_id));
			await checkPolicy(permissions.UpdatePolicy, actor, community_id, repos);

			log.trace('updating role', policy_id, data);
			const policy = unwrap(await repos.policy.update(policy_id, data));
			return {ok: true, status: 200, value: {policy}};
		}),
};

export const DeletePolicyService: ServiceByName['DeletePolicy'] = {
	event: DeletePolicy,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			const {actor, policy_id} = params;

			const {community_id} = unwrap(await repos.role.findByPolicy(policy_id));
			await checkPolicy(permissions.DeletePolicy, actor, community_id, repos);

			log.trace('deleting policy', policy_id);
			unwrap(await repos.policy.deleteById(policy_id));

			return {ok: true, status: 200, value: null};
		}),
};
