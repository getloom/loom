export const RESERVED_PERSONA_NAMES = new Set(['admin', 'ghost', 'docs', 'schemas', 'about']);

export const isPersonaNameReserved = (name: string): boolean =>
	RESERVED_PERSONA_NAMES.has(name.toLowerCase());

// TODO generate from schema?
// TODO should be global? `COLUMNS.Persona`, maybe in `$lib/vocab/helpers.server.ts`

export const PERSONA_COLUMNS = {
	Persona: ['persona_id', 'type', 'name', 'account_id', 'community_id', 'created', 'updated'],
	PublicPersona: ['persona_id', 'type', 'name', 'created'],
};
