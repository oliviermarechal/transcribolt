import { App } from '../../../../packages/core/app/app';
import { json } from '@sveltejs/kit';
import { CalculateCostUseCase } from 'core/usecases';

const app = App.getInstance();

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	const data = await request.formData();
	const file = data.get('file') as unknown as File;
	const calculateCostUseCase = app.getUseCase(CalculateCostUseCase.name);
	const { duration, cost } = await calculateCostUseCase.handle({
		buffer: Buffer.from(await file.arrayBuffer()),
		type: file.type,
		originalFilename: file.name,
	});

	return json({ duration, cost });
}
