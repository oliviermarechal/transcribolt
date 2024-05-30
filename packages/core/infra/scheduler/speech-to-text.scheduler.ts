import cron from 'node-cron';
import { App } from '../../app/app';
import { TranscriptorGateway } from '../gateway/transcriptor.gateway';
import { MailerGateway } from '../gateway/mailer.gateway';

// */15 * * * *
cron.schedule('* * * * *', async () => {
	const db = App.getDb();
	const transcriptor = new TranscriptorGateway();
	const mailer = new MailerGateway();
	const pendingTranscriptionRequest = await db
		.selectFrom('transcription_request')
		.where('status', '=', 'waiting_result')
		.selectAll()
		.execute();

	await Promise.all(pendingTranscriptionRequest.map(async (request) => {
		const items = await db
			.selectFrom('transcription_request_item')
			.where('transcription_id', '=', request.id)
			.selectAll()
			.execute();

		let allItemsDone = true;
		const buffers: {buffer: Buffer, fileName: string}[] = [];
		for (const item of items) {
			const operation = await transcriptor.retrieveTask(item.task_id as string);
			if (operation.done) {
				const value = operation?.response?.value;
				if (Buffer.isBuffer(value)) {
					buffers.push({ buffer: value as Buffer, fileName: item.file_name })
				} else if (value instanceof Uint8Array) {
					buffers.push({ buffer: Buffer.from(operation?.response?.value as Uint8Array), fileName: item.file_name});
				}
			} else {
				allItemsDone = false;
			}
		}

		if (allItemsDone) {
			await Promise.all([
				...items.map((i) => transcriptor.dropFile(i.file_name)),
				mailer.sendTranscriptionResult(request.email, buffers),
				db.updateTable('transcription_request')
					.set({status: 'done'})
					.where('id', '=', request.id)
					.execute(),
				],
			);
		}
	}))
});