import {ADMIN_HUB_ID} from '$lib/app/constants';
import type {Repos} from '$lib/db/Repos';

export const RESERVED_ACTOR_NAMES = new Set([
	'about',
	'admin',
	'api',
	'docs',
	'ghost',
	'schemas',
	'vocab',
]);

export const isPersonaNameReserved = (name: string): boolean =>
	RESERVED_ACTOR_NAMES.has(name.toLowerCase());

// TODO generate from schema?
// TODO should be global? `COLUMNS.Persona`, maybe in `$lib/vocab/helpers.server.ts`

export const ACTOR_COLUMNS = {
	Persona: ['persona_id', 'type', 'name', 'account_id', 'hub_id', 'created', 'updated'],
	PublicPersona: ['persona_id', 'type', 'name', 'created'],
};

export const isPersonaAdmin = async (actor_id: number, repos: Repos): Promise<boolean> => {
	return repos.assignment.isPersonaInHub(actor_id, ADMIN_HUB_ID);
};
