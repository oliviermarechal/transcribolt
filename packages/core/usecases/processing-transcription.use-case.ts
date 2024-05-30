import type { UseCaseInterface } from '../domain/interfaces';
import type { PaymentGatewayInterface, TranscriptorGatewayInterface } from '../domain/gateway';
import { App } from '../app/app';
import { v4 as uuidv4 } from 'uuid';

export class ProcessingTranscriptionUseCase implements UseCaseInterface {
	constructor(
		private readonly paymentGateway: PaymentGatewayInterface,
		private readonly transcriptorGateway: TranscriptorGatewayInterface,
	) {}
	async handle(
		files: { buffer: Buffer, language: string, name: string }[],
		email: string,
		checkoutId: string,
		orderId: string,
	): Promise<void> {
		const db = App.getDb();
		const transcriptionRequest = await db
			.selectFrom('transcription_request')
			.where('checkout_id', '=', checkoutId)
			.selectAll()
			.executeTakeFirst();

		if (transcriptionRequest && await this.paymentGateway.checkPaymentSuccess(orderId)) {
			for (const file of files) {
				const { taskId, gcsFilename } = await this.transcriptorGateway.transcribeAudio(file.buffer, file.language, file.name);
				await Promise.all([
					db.insertInto('transcription_request_item').values({
						id: uuidv4(),
						transcription_id: transcriptionRequest.id,
						file_name: file.name,
						gcs_file_name: gcsFilename,
						task_id: taskId,
					}).execute(),
					db.updateTable('transcription_request').set({order_id: orderId, status: 'waiting_result'}).where('id', '=', transcriptionRequest.id).execute(),
				]);
			}
		}
	}
}
