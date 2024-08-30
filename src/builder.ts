import * as fs from 'node:fs/promises';

import { config } from './index.js';
import Path from './path.js';
import log from './log.js';

export default async function build(path: Path): Promise<void> {
    const dest = path.replaceBase(config.get().root, config.get().build);

    await fs.mkdir(dest.parent().path, { recursive: true });

    const variables = {
        Path,
        include: (path: string | Path) => fs.readFile(new Path(path).path, { encoding: 'utf8' }),
        page: Path
    };

    const content = await template(await fs.readFile(path.path, { encoding: 'utf8' }), variables);

    await fs.writeFile(dest.path, content, { encoding: 'utf8' });
}

export async function template(source: string, variables: Record<string, any>): Promise<string> {
    outer: while (source.includes('<?js(')) {
        const index = source.indexOf('<?js(');
        let bracketCount = 1;

        for (const [a, char] of Object.entries(source.slice(index)))
            if (char == '(')
                bracketCount++;
            else if (char == ')')
                if (--bracketCount == 0) {
                    const expr = source.slice(index, index + Number(a));

                    log.debug(expr);
                    break outer;
                }
    }

    return "";
}