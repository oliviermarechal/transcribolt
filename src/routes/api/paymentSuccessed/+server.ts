import { App } from '$lib/server/app/app';
import { ProcessingTranscriptionUseCase } from '$lib/server/usecases';
import type { UploadedTranscriptionFileInterface } from '$lib/server/domain/interfaces';
import type { OutputFormat } from '$lib/actions/on-payment-successed';
import fs from 'fs';
import { json } from '@sveltejs/kit';

const app = App.getInstance();

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	const data = await request.formData();

	let index = 0;
	let files: UploadedTranscriptionFileInterface[] = [];
	let hasFiles = true;
	while (hasFiles) {
		if (data.has(`fileNames[${index}]`)) {
			const file = data.get(`files[${index}]`) as File
			files.push({
				buffer: Buffer.from(await file.arrayBuffer()),
				language: data.get(`languages[${index}]`) as string,
				name: data.get(`fileNames[${index}]`) as string,
				outputFormat: data.get(`outputFormat[${index}]`) as OutputFormat,
			})
		} else {
			hasFiles = false;
		}
		index++;
	}

	const checkoutId = data.get('checkoutId') as string;

	const processingTranscriptionUseCase = app.getUseCase<ProcessingTranscriptionUseCase>(ProcessingTranscriptionUseCase.name);

	const zipBuffer = await processingTranscriptionUseCase.handle(
		files,
		checkoutId,
	);

	if (!zipBuffer) {
		return json({}, {status: 400})
	}

	return new Response(zipBuffer, {
		headers: {
			'Content-Type': 'application/zip',
			'Content-Disposition': 'attachment; filename="transcriptions.zip"',
		},
	});
}
