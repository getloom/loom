import type {Task} from '@ryanatkn/gro';

export const task: Task = {
	summary: 'deploys the latest version of the instances home site',
	run: async ({log}) => {
		log.info("deploying latest site version");
        //NOOP in DEV? Or use pm2 vs npm?
        //clean old build dirs
        //clone latest repo at dir above loom into timestamped site_<> dir?
        //cd dir
        //npm run build
        //symlink
        //run start command
	},
};