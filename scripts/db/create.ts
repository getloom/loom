import { destroy } from "./destroy";
import { migrate } from "./migrate";
import { seedDB } from "./seed";

export async function create(){
    await destroy();
    await migrate();
    await seedDB();
}