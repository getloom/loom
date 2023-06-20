import {ADMIN_HUB_ID} from '$lib/util/constants';
import type {Repos} from '$lib/db/Repos';
import type {Actor, ActorId} from '$lib/vocab/actor/actor';

export type ActorColumn = keyof Actor;
export const ACTOR_COLUMNS = {
	all: ['actor_id', 'type', 'name', 'account_id', 'hub_id', 'created', 'updated'],
	public: ['actor_id', 'type', 'name', 'created'],
	public_with_account_id: ['account_id', 'actor_id', 'type', 'name', 'created'],
	actor_id: ['actor_id'],
	type_hub_id: ['type', 'hub_id'],
	account_id: ['account_id'],
} satisfies Record<string, ActorColumn[]>;

export const RESERVED_ACTOR_NAMES = new Set([
	'about',
	'admin',
	'api',
	'docs',
	'ghost',
	'schemas',
	'vocab',
]);

export const isActorNameReserved = (name: string): boolean =>
	RESERVED_ACTOR_NAMES.has(name.toLowerCase());

export const isActorAdmin = async (actor_id: ActorId, repos: Repos): Promise<boolean> => {
	return repos.assignment.isActorInHub(actor_id, ADMIN_HUB_ID);
};
