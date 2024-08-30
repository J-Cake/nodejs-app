import * as fs from 'node:fs/promises';
import * as fss from 'node:fs';
import * as path from 'node:path';

import State from '@j-cake/jcake-utils/state';
import { iterSync } from '@j-cake/jcake-utils/iter';
import * as Format from '@j-cake/jcake-utils/args';

import log from './log.js';
import Path from './path.js';
import builder from './builder.js';

type LogLevel = keyof typeof log;

export const config = new State({
    logLevel: 'info' as LogLevel,
    
    root: new Path("./pages"),
    build: new Path("./build"),

    language: [] as string[]
});

export default async function main(argv: string[]): Promise<boolean> {
    const logLevel = Format.oneOf(Object.keys(log) as LogLevel[], false);
    
    for (const { current: i, skip: next } of iterSync.peekable(argv))
        if (i == '--log-level')
            config.setState({ logLevel: logLevel(next()) });

        else if (i == '--root')
            config.setState({ root: new Path(next()) });

        else if (i == '--build')
            config.setState({ build: new Path(next()) });

        else if (i == '--language' || i == '-l')
            config.setState(prev => ({ language: prev.language.concat(next()) }));

    for await (const path of config.get().root.readdir())
        if (await path.isFile())
            await builder(path);

    return true;
}
