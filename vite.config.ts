import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';
import dotenvExpand from 'dotenv-expand';
import path from 'path';

export default defineConfig(({mode}) => {
	const env = loadEnv(mode, process.cwd(), '');
	dotenvExpand.expand({ parsed: env });

	return {
		plugins: [sveltekit()],
		resolve: {
			alias: {
				core: path.resolve(__dirname, '../packages/core')
			}
		}
	}
});
