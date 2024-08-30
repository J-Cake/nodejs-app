import * as fs from 'node:fs/promises';
import * as fss from 'node:fs';
import * as path from 'node:path';

export default class Path {
    public path: string;
    
    constructor(str: string | fss.Dirent | Path) {
        if (str instanceof fss.Dirent)
            this.path = path.join(str.parentPath, str.name);
        else if (str instanceof Path)
            this.path = str.path;
        else
            this.path = path.isAbsolute(str) ? str : path.join(process.cwd(), str);
    }
    
    concat(...paths: Array<Path|string>): Path {
        this.path = path.join(this.path, ...paths.map(i => i instanceof Path ? i.path : i));
        return this;
    }

    join(...paths: Array<Path|string>): Path {
        return new Path(path.join(this.path, ...paths.map(i => i instanceof Path ? i.path : i)));
    }

    ext(): string {
        return this.path.split(path.sep).pop()?.split('.').pop()?.toLowerCase() ?? '';
    }

    async *readdir(recursive = true): AsyncGenerator<Path> {
        const files = await fs.readdir(this.path, { recursive, withFileTypes: true })

        for (const dirent of files)
            yield new Path(dirent);

        // for await (const dir of await fs.readdir(config.get().root.path, { recursive: true, withFileTypes: true }))
        //     if (dir.isFile())
        //         log.info(new Path(dir));
    }

    async isFile(): Promise<boolean> {
        return await fs.stat(this.path).then(stat => stat.isFile());
    }

    async isDir(): Promise<boolean> {
        return await fs.stat(this.path).then(stat => stat.isDirectory());
    }

    async isBlockdev(): Promise<boolean> {
        return await fs.stat(this.path).then(stat => stat.isBlockDevice());
    }

    async isChardev(): Promise<boolean> {
        return await fs.stat(this.path).then(stat => stat.isCharacterDevice());
    }

    async isPipe(): Promise<boolean> {
        return await fs.stat(this.path).then(stat => stat.isFIFO() || stat.isSocket());
    }

    async isFifo(): Promise<boolean> {
        return await fs.stat(this.path).then(stat => stat.isFIFO());
    }

    async isSocket(): Promise<boolean> {
        return await fs.stat(this.path).then(stat => stat.isSocket());
    }

    async isSymlink(): Promise<boolean> {
        return await fs.stat(this.path).then(stat => stat.isSymbolicLink());
    }

    replaceBase(base: Path, newBase: Path): Path {
        if (this.path.startsWith(base.path))
            return newBase.join(this.path.slice(base.path.length));

        else
            throw { 
                err: 'Could not substitute path',
                reason: `Path does not start with '${base.path}'`, 
                path: this 
            };
    }

    parent(): Path {
        return new Path(this.path.split(path.sep).slice(0, -1).join(path.sep));
    }
}