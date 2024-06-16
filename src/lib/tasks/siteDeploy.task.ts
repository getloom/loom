import type {Task} from '@ryanatkn/gro';
import {spawn} from '@ryanatkn/belt/process.js';
import {unwrap} from '@ryanatkn/belt/result.js';
import { z } from 'zod';
import { execSync } from 'node:child_process';
import type * as env_static_public from '$env/static/public';

//import { load_envs } from '$lib/server/env';

const Args = z
	.object({
		_: z.array(
            z.string(), {description: 'sourceRepo to deploy site from & dev flag'},            
        ).default([]),      	
        dev: z.boolean({description: 'dev flag, set true to be dev mode'}).default(false),        
        env: z.any({description: 'static public env vars'})
	})
	.strict();
type Args = z.infer<typeof Args>;

export const task: Task<Args> = {
	summary: 'deploys the latest version of the instances home site',
	run: async ({args, log}) => {
        const {_: params, env, dev} = args;
        if (params === null || params.length !== 1 || params[0] === '') {
            log.error("no sourceRepo provided");
            //TODO figure out how to actually get this info back up the chain to spawnSync in taskServices
            throw Error("sourceRepo is a required arg");
        }
        //This script is for managing the home site on a default, production loom instance.
        if (dev){
            log.warn("script is in dev mode")                        
            return;            
        }
        if (!host){
            log.warn("")
        }
                     
        //TODO pass these vars as top level args from frontend?
        const {PUBLIC_SITE_HOST, PUBLIC_SITE_PORT} = await load_envs(false);
            
        //clean old build dirs
        //const LOOM_DIR = process.cwd();
        const TIMESTAMP = Date.now();
        const DEPLOY_DIRNAME = `site_${TIMESTAMP}`;
        //clone latest repo at dir above loom into timestamped site_<> dir?
        
        process.chdir('../');        
        unwrap(await spawn('mkdir', [`${DEPLOY_DIRNAME}`] ))
        unwrap(await spawn('git', ['clone', params[0], DEPLOY_DIRNAME]));
        process.chdir(DEPLOY_DIRNAME);
        unwrap(await spawn('npm',['ci']));
        unwrap(await spawn('npm',['run', 'build']));
        //symlink
        //run start command
        //since we're running this one without user input, we can get away with a direct exec
        execSync(`ORIGIN=${PUBLIC_SITE_HOST} PORT=${PUBLIC_SITE_PORT} pm2 start node --name 'site' -- build`)
	},
};