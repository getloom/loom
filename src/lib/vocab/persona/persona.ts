// generated by src/lib/vocab/persona/persona.schema.ts

export interface AccountPersona {
	persona_id: number;
	account_id: number;
	community_id: number;
	type: 'account';
	name: string;
	icon?: string;
	created: Date;
	updated: Date | null;
}
export interface CommunityPersona {
	persona_id: number;
	account_id?: null;
	community_id: number;
	type: 'community';
	name: string;
	icon?: string;
	created: Date;
	updated: Date | null;
}
export interface GhostPersona {
	persona_id: number;
	account_id?: null;
	community_id?: null;
	type: 'ghost';
	name: string;
	icon?: string;
	created: Date;
	updated: Date | null;
}
export type Persona = AccountPersona | CommunityPersona | GhostPersona;

// generated by src/lib/vocab/persona/persona.schema.ts
