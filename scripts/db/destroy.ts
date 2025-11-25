import postgres from 'postgres';
import {postgresOptions} from './util'

export async function destroy(){
    console.log("Running destroy")

    const db = postgres(postgresOptions)

    await db.unsafe(`
            drop schema public cascade;
            create schema public;
            alter schema public owner to postgres;
            grant all on schema public to postgres;
            grant all on schema public to ${postgresOptions.username};
            grant all on schema public to public;
        `);

    await db.end();

}