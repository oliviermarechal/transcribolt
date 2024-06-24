import type { TranscriptorGatewayInterface } from '../../domain/gateway';
import OpenAI from 'openai';
import type { UploadedTranscriptionFileInterface } from '../../domain/interfaces';
import { env } from '$env/dynamic/private'
import fs from 'fs';

export class TranscriptorGateway implements TranscriptorGatewayInterface {
	private client?: OpenAI;

	constructor() {
		if (env.OPENAI_API_KEY) {
			this.client = new OpenAI({
				apiKey: env.OPENAI_API_KEY,
			});
		}
	}

	async transcribeAudio(filePath: string, file: UploadedTranscriptionFileInterface): Promise<string> {
		const body: OpenAI.Audio.Transcriptions.TranscriptionCreateParams = {
			file: fs.createReadStream(filePath),
			model: "whisper-1",
			language: file.language,
			response_format: file.outputFormat,
		}

		if (file.outputFormat === 'verbose_json' && file.timestampGranularity) {
			body.timestamp_granularities = [file.timestampGranularity];
		}

		if (!this.client) {
			throw new Error('Client is not initialized')
		}

		const transcriptionResult = await this.client.audio.transcriptions.create(body);

		return transcriptionResult.text ? transcriptionResult.text : transcriptionResult as unknown as string;
	}
}