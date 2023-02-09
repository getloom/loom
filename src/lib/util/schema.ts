import {stripEnd, stripStart} from '@feltjs/util/string.js';

// see also $lib/util/ajv.ts

export const toSchemaName = ($id: string): string =>
	stripEnd(stripStart($id, '/schemas/'), '.json');
