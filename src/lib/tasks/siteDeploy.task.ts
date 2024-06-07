import type {Task} from '@ryanatkn/gro';
import {spawn} from '@ryanatkn/belt/process.js';
import {unwrap} from '@ryanatkn/belt/result.js';
export const task: Task = {
	summary: 'deploys the latest version of the instances home site',
	run: async ({log}) => {
		unwrap(await spawn('touch', ['test.txt']));
        //NOOP in DEV? Or use pm2 vs npm?
        //clean old build dirs
        //clone latest repo at dir above loom into timestamped site_<> dir?
        //cd dir
        //npm run build
        //symlink
        //run start command
	},
};