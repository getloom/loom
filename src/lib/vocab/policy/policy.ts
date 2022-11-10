// generated by src/lib/vocab/policy/policy.schema.ts

export interface Policy {
	policy_id: number;
	role_id: number;
	permission: string;
	data: {
		[k: string]: unknown;
	} | null;
	created: Date;
	updated: Date | null;
}

// generated by src/lib/vocab/policy/policy.schema.ts
