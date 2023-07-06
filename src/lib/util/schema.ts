/**
 * This is like Gro's `parseSchemaName` but optimized for the client.
 * Extracts the name of a schema, removing the `/schemas/` prefix.
 * @param $id
 * @returns schema name
 */
export const toSchemaName = ($id: string): string => $id.substring(9);
