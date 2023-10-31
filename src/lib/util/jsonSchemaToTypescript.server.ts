import type {SchemaObject} from 'ajv';
import {compile, type Options} from '@ryanatkn/json-schema-to-typescript';
import type {Json_Schema} from '@grogarden/gro/schema.js';

export const jsonSchemaToTypescript = (
	schema: Json_Schema | SchemaObject | null,
	name: string,
	options?: Partial<Options> | undefined,
): string | Promise<string> => {
	if (schema && typeof schema === 'object') {
		return compile(schema, name, {bannerComment: '', format: false, ...options});
	}
	return `export type ${name} = void;`;
};

export type Json_SchemaToTypeScriptOptions = Options;
