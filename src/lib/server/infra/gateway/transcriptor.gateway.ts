import type { TranscriptorGatewayInterface } from '../../domain/gateway';
import OpenAI, { toFile } from 'openai';
import type { UploadedTranscriptionFileInterface } from '../../domain/interfaces';
import { OPENAI_API_KEY } from '$env/dynamic/private'

export class TranscriptorGateway implements TranscriptorGatewayInterface {
	private client: OpenAI;

	constructor() {
		this.client = new OpenAI({
			apiKey: OPENAI_API_KEY,
		});
	}

	async transcribeAudio(file: UploadedTranscriptionFileInterface): Promise<OpenAI.Audio.Transcriptions.Transcription> {
		const body: OpenAI.Audio.Transcriptions.TranscriptionCreateParams = {
			file: await toFile(file.buffer),
			model: "whisper-1",
			language: file.language,
			response_format: file.outputFormat,
		}

		if (file.outputFormat === 'verbose_json' && file.timestampGranularity) {
			body.timestamp_granularities = [file.timestampGranularity];
		}

		return this.client.audio.transcriptions.create(body)
	}
}