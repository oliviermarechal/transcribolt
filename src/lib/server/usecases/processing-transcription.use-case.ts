import type { UploadedTranscriptionFileInterface, UseCaseInterface } from '../domain/interfaces';
import type { PaymentGatewayInterface, TranscriptorGatewayInterface } from '../domain/gateway';
import { App } from '../app/app';
import { v4 as uuidv4 } from 'uuid';
import { fileTypeFromBuffer } from 'file-type';
import { promises as fs } from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';

export class ProcessingTranscriptionUseCase implements UseCaseInterface {
	constructor(
		private readonly paymentGateway: PaymentGatewayInterface,
		private readonly transcriptorGateway: TranscriptorGatewayInterface,
	) {}

	async handle(
		files: UploadedTranscriptionFileInterface[],
		checkoutId: string,
	): Promise<{ data: string, filename: string, outputFormat: string }[]> {
		const db = App.getDb();
		const transcriptionRequest = await db
			.selectFrom('transcription_request')
			.where('checkout_id', '=', checkoutId)
			.selectAll()
			.executeTakeFirst();

		const transcriptions: { data: string, filename: string, outputFormat: string }[] = [];
		if (transcriptionRequest && await this.paymentGateway.checkPaymentSuccess(checkoutId)) {
			const splittedFiles: UploadedTranscriptionFileInterface[] = [];
			for (const file of files) {
				const type = await fileTypeFromBuffer(file.buffer);
				if (type?.mime.startsWith('video')) {
					const tmpPath = `/tmp/${path.parse(file.name).name}`;
					const audioPath = `/tmp/audio_${path.parse(file.name).name}.mp3`;
					await fs.writeFile(tmpPath, file.buffer);
					await new Promise((resolve, reject) => {
						ffmpeg(tmpPath)
							.output(audioPath)
							.on('end', resolve)
							.on('error', reject)
							.run();
					});
					const [buffer] = await Promise.all([
						fs.readFile(audioPath),
						fs.unlink(tmpPath)
					]);

					file.buffer = buffer;
					await fs.unlink(audioPath);
				}

				const audioSize = file.buffer.length;
				if (audioSize > 20 * 1024 * 1024) { // 20 MB
					const tmpFilename = `/tmp/${path.parse(file.name).name}`;
					await fs.writeFile(tmpFilename, file.buffer);

					let duration: number;
					let bitrate = 128 * 1024;
					await new Promise((resolve) => {
						ffmpeg.ffprobe(tmpFilename, (err, metadata) => {
							duration = metadata.format.duration as number;
							bitrate = metadata.format.bit_rate ? metadata.format.bit_rate : bitrate;
							resolve(null);
						});
					});

					const partSizeBytes = 20 * 1024 * 1024;
					const partDurationSeconds = partSizeBytes / (bitrate / 8);
					// @ts-ignore
					const numParts = Math.ceil(duration / partDurationSeconds);
					for (let i = 0; i < numParts; i++) {
						const startTime = i * partDurationSeconds;
						const outputFilename = `${tmpFilename}_part${i + 1}.mp3`;

						await new Promise((resolve, reject) => {
							ffmpeg(tmpFilename)
								.setStartTime(startTime)
								.setDuration(partDurationSeconds)
								.output(outputFilename)
								.on('end', resolve)
								.on('error', reject)
								.run();
						});

						const partBuffer = await fs.readFile(outputFilename);
						splittedFiles.push({ ...file, buffer: partBuffer, name: `${path.parse(file.name).name}_part${i + 1}` });
					}
				} else {
					splittedFiles.push(file);
				}
			}

			await Promise.all(splittedFiles.map(async file => {
				await fs.writeFile(`/tmp/${file.name}`, file.buffer);
				const transcription = await this.transcriptorGateway.transcribeAudio(`/tmp/${file.name}`, file);
				await Promise.all([
					db.insertInto('transcription_request_item').values({
						id: uuidv4(),
						transcription_id: transcriptionRequest.id,
						file_name: file.name,
						output_format: file.outputFormat,
						timestamp_granularity: file.timestampGranularity,
					}).execute(),
					db.updateTable('transcription_request').set({status: 'done'}).where('id', '=', transcriptionRequest.id).execute(),
					fs.unlink(`/tmp/${file.name}`),
				]);

				transcriptions.push({ data: transcription, filename: path.parse(file.name).name, outputFormat: file.outputFormat });
			}));

			return transcriptions;
		}

		return transcriptions;
	}
}
