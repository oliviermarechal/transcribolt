import { App } from 'core/app/app';
import { json } from '@sveltejs/kit';
import { ProcessingTranscriptionUseCase } from 'core/usecases';

const app = App.getInstance();

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	const data = await request.formData();

	let index = 0;
	let files: {buffer: Buffer, language: string, name: string}[] = [];
	while (data.has(`files[${index}]`)) {
		let file = data.get(`files[${index}]`) as File;
		let language = data.get(`languages[${index}]`) as string;
		let fileName = data.get(`fileNames[${index}]`) as string;

		files.push({ buffer: Buffer.from(await file.arrayBuffer()), language, name: fileName });
		index++;
	}

	const email = data.get('email');
	const checkoutId = data.get('checkoutId');
	const orderId = data.get('orderId');

	const processingTranscriptionUseCase = app.getUseCase(ProcessingTranscriptionUseCase.name);

	await processingTranscriptionUseCase.handle(
		files,
		email,
		checkoutId,
		orderId,
	);

	return json({})
}
