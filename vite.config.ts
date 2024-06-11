import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';
import dotenvExpand from 'dotenv-expand';

export default defineConfig(({mode}) => {
	if (process.env.NODE_ENV !== 'production') {
		const env = loadEnv(mode, process.cwd(), '');
		dotenvExpand.expand({ parsed: env });
	}

	return {
		plugins: [sveltekit()],
	}
});
