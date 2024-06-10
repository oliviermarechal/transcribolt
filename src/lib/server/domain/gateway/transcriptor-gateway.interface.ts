import OpenAI from 'openai';
import type { UploadedTranscriptionFileInterface } from '../interfaces';

export interface TranscriptorGatewayInterface {
	transcribeAudio(file: UploadedTranscriptionFileInterface): Promise<OpenAI.Audio.Transcriptions.Transcription>;
}