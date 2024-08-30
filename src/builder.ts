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
    let input = source;
    outer: while (input.includes('<?js(')) {
        let bracketCount = 0;
        const index = input.indexOf('<?js(');
        const token: string | null = [...input.slice(index)]
            .first((char, a) => {
                if (char == '(') bracketCount++;
                else if (char == ')' && --bracketCount == 0) return { some: input.slice(index, input.indexOf('?>', index + a) + 2) };
            });

        if (!token)
            continue outer;
    
        input = input.slice(0, index) + eval(token.slice(4, -2)).toString() + input.slice(index + token.length);
    }

    return input;
}

declare class Array<T> {
    first<J>(predicate: (i: T, a: number) => null | {some: J}): J | null;
}

Array.prototype.first = function<T, J>(this: Array<T>, predicate: (i: any, a: number) => null | {some: J}): J | null {
    for (const [a, i] of Object.entries(this)) {
        const res = predicate(i, Number(a));

        if (res != null && 'some' in res)
            return res.some;
    }

    return null;
};