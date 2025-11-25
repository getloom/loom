import postgres from 'postgres';
import {postgresOptions} from './util'

import {seed} from '../../src/lib/db/seed.js';
import {Database} from '../../src/lib/db/Database.js';

const much = false

const db = new Database({sql: postgres(postgresOptions)})

await seed(db, much);

db.close();
