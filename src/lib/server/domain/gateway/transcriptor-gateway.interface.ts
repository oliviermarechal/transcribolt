import OpenAI from 'openai';
import type { UploadedTranscriptionFileInterface } from '../interfaces';

export interface TranscriptorGatewayInterface {
	transcribeAudio(filePath: string, file: UploadedTranscriptionFileInterface): Promise<string>;
}