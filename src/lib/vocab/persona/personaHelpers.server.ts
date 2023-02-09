import {ADMIN_COMMUNITY_ID} from '$lib/app/constants';
import type {Repos} from '$lib/db/Repos';
import {unwrap} from '@feltjs/util';

export const RESERVED_PERSONA_NAMES = new Set(['admin', 'ghost', 'docs', 'schemas', 'about']);

export const isPersonaNameReserved = (name: string): boolean =>
	RESERVED_PERSONA_NAMES.has(name.toLowerCase());

// TODO generate from schema?
// TODO should be global? `COLUMNS.Persona`, maybe in `$lib/vocab/helpers.server.ts`

export const PERSONA_COLUMNS = {
	Persona: ['persona_id', 'type', 'name', 'account_id', 'community_id', 'created', 'updated'],
	PublicPersona: ['persona_id', 'type', 'name', 'created'],
};

export const isPersonaAdmin = async (actor_id: number, repos: Repos): Promise<boolean> => {
	return unwrap(await repos.assignment.isPersonaInCommunity(actor_id, ADMIN_COMMUNITY_ID));
};
