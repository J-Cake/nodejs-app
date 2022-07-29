import chalk from 'chalk';
import app from '#app';

export function error(err) {
    const msg = err instanceof Error ? err.stack : err.toString();
    
    process.stderr.write(msg.split('\n').map((i, a) => `${a ? '   \u2502   ' : chalk.grey(`[${chalk.red('Error')}]`)} ${i}`).join('\n') + '\n');
}

const status = await app(process.argv.slice(2))
    .catch(err => {
        error(err);
        return false;
    });

if (status)
    console.log(chalk.grey(`[${chalk.green('Exit')}]`), 'Process exited cleanly');

else {
    console.error(chalk.grey(`[${chalk.red('Error')}]`), 'Process exited with error');
    process.exit(-1);
}
