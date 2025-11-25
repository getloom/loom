import postgres from 'postgres';
import {postgresOptions} from './util.ts'

export async function destroy(){
    console.log("Running destroy")
    console.log("confirming options")
    console.log(postgresOptions);
    console.log("debugging env vars")
    console.log(process.env);

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