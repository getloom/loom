import { destroy } from "./destroy";
import { migrate } from "./migrate";
import { seedDB } from "./seed";


const task = process.argv[2];

switch(task){
    case 'destroy':
        console.log("destroy selected");
        await destroy();
        break;
    case 'migrate':
        console.log("migrate selected");
        await migrate();
        break;
    case 'seed':
        console.log("seed selected");
        await seedDB();
        break;
    case 'create':
        console.log("create selected")
        await destroy();
        await migrate();
        await seedDB();
        break;
    default:
        console.log("task not selected");
        console.log(task);
}