import type { UploadedTranscriptionFileInterface, UseCaseInterface } from '../domain/interfaces';
import type { PaymentGatewayInterface, TranscriptorGatewayInterface } from '../domain/gateway';
import { App } from '../app/app';
import { v4 as uuidv4 } from 'uuid';

export class ProcessingTranscriptionUseCase implements UseCaseInterface {
	constructor(
		private readonly paymentGateway: PaymentGatewayInterface,
		private readonly transcriptorGateway: TranscriptorGatewayInterface,
	) {}

	async handle(
		files: UploadedTranscriptionFileInterface[],
		checkoutId: string,
		orderId: string,
	): Promise<any[]> {
		const db = App.getDb();
		const transcriptionRequest = await db
			.selectFrom('transcription_request')
			.where('checkout_id', '=', checkoutId)
			.selectAll()
			.executeTakeFirst();

		if (transcriptionRequest && await this.paymentGateway.checkPaymentSuccess(orderId)) {
			return Promise.all(files.map(async (file) => {
				const transcription = await this.transcriptorGateway.transcribeAudio(file);
				await Promise.all([
					db.insertInto('transcription_request_item').values({
						id: uuidv4(),
						transcription_id: transcriptionRequest.id,
						file_name: file.name,
						output_format: file.outputFormat,
						timestamp_granularity: file.timestampGranularity,
					}).execute(),
					db.updateTable('transcription_request').set({order_id: orderId, status: 'done'}).where('id', '=', transcriptionRequest.id).execute(),
				]);

				return transcription;
			}))
		}

		return [];
	}
}
