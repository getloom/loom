export const RESERVED_PERSONA_NAMES = new Set(['admin', 'ghost', 'docs', 'schemas', 'about']);

export const isPersonaNameReserved = (name: string): boolean =>
	RESERVED_PERSONA_NAMES.has(name.toLowerCase());
