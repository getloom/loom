import {Logger} from '@ryanatkn/belt/log.js';
import {blue, gray} from '$lib/server/colors.js';

import {spawn} from '@ryanatkn/belt/process.js';
import {unwrap} from '@ryanatkn/belt/result.js';
import { execSync } from 'node:child_process';

import { load_envs } from '$lib/server/env';

const log = new Logger(gray('[') + blue('siteDeploy') + gray(']'));

export const invoke = async (sourceRepo: string, dev: boolean): Promise<{ok: boolean}> => {                
        //This script is for managing the home site on a default, production loom instance.
        if (dev){
            log.warn("script is in dev mode")                        
            //TODO BLOCK refactor return type
            return {ok: false}            
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
        unwrap(await spawn('git', ['clone', sourceRepo, DEPLOY_DIRNAME]));
        process.chdir(DEPLOY_DIRNAME);
        unwrap(await spawn('npm',['ci']));
        unwrap(await spawn('npm',['run', 'build']));
        //symlink
        //run start command
        //since we're running this one without user input, we can get away with a direct exec
        execSync(`ORIGIN=${PUBLIC_SITE_HOST} PORT=${PUBLIC_SITE_PORT} pm2 start node --name 'site' -- build`)
        return {ok: true}
	};