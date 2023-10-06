import postgres from 'postgres';

import {Database} from '$lib/db/Database.js';
import {defaultPostgresOptions} from '$lib/db/postgres.js';

export const db = new Database({sql: postgres(defaultPostgresOptions)});
