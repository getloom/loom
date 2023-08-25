import type {VocabName} from '$lib/vocab/vocab';

/**
 * This is like Gro's `parseSchemaName` but optimized for the client.
 * Extracts the name of a schema, removing the `/schemas/` prefix.
 * @param $id
 * @returns schema name
 */
export const toSchemaName = ($id: string): VocabName => $id.substring(9) as VocabName;
