import pkg from '@google-cloud/speech/build/protos/protos';

export interface TranscriptorGatewayInterface {
	transcribeAudio(buffer: Buffer, language: string, fileName: string): Promise<{ taskId: string, gcsFilename: string }>;
	retrieveTask(taskId: string): Promise<pkg.google.longrunning.Operation>;
}