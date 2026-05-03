import { spawn } from 'node:child_process';
import process from 'node:process';

await run('node', ['tools/sync-posts.mjs']);
await run('node', ['tools/sync-projects.mjs']);

function run(command, args) {
	return new Promise((resolve, reject) => {
		const child = spawn(command, args, {
			cwd: process.cwd(),
			stdio: 'inherit',
			shell: false,
		});

		child.on('exit', (code) => {
			if (code === 0) {
				resolve();
				return;
			}

			reject(new Error(`${command} ${args.join(' ')} exited with code ${code ?? 'unknown'}`));
		});
	});
}
