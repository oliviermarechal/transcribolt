import { SpeechClient } from '@google-cloud/speech'
import { Storage } from '@google-cloud/storage';
import type { TranscriptorGatewayInterface } from '../../domain/gateway';
import { fileTypeFromBuffer } from 'file-type';
import pkg from '@google-cloud/speech/build/protos/protos';

export class TranscriptorGateway implements TranscriptorGatewayInterface {
	private client: SpeechClient;
	private storageClient: Storage;
	private bucketName: string;

	constructor() {
		this.client = new SpeechClient({
			credentials: {
				client_email: process.env.PRIVATE_GOOGLE_CLOUD_CLIENT_EMAIL,
				private_key: process.env.PRIVATE_GOOGLE_CLOUD_PRIVATE_KEY,
			},
			projectId: process.env.PRIVATE_GOOGLE_CLOUD_PROJECT,
		})
		this.storageClient = new Storage({
			credentials: {
				client_email: process.env.PRIVATE_GOOGLE_CLOUD_CLIENT_EMAIL,
				private_key: process.env.PRIVATE_GOOGLE_CLOUD_PRIVATE_KEY,
			},
			projectId: process.env.PRIVATE_GOOGLE_CLOUD_PROJECT,
		});

		this.bucketName = process.env.PRIVATE_GOOGLE_CLOUD_STORAGE_BUCKET as string;
	}

	async uploadAudioToGCS(buffer: Buffer, fileName: string): Promise<string> {
		const bucket = this.storageClient.bucket(this.bucketName);
		const file = bucket.file(fileName);

		const fileType = await fileTypeFromBuffer(buffer);
		const contentType = fileType ? fileType.mime : 'application/octet-stream';

		await file.save(buffer, {
			contentType: contentType,
		});

		return `gs://${this.bucketName}/${fileName}`;
	}

	async transcribeAudio(buffer: Buffer, language: string, fileName: string): Promise<{ taskId: string, gcsFilename: string }> {
		const gcsUri = await this.uploadAudioToGCS(buffer, fileName);
		const [operation] = await this.client.longRunningRecognize({
			audio: { uri: gcsUri },
			config: {
				encoding: 'LINEAR16',
				sampleRateHertz: 16000,
				languageCode: language,
				enableAutomaticPunctuation: true,
				enableWordTimeOffsets: true,
			},
		})

		return { taskId: operation.name as string, gcsFilename: gcsUri }
	}

	async retrieveTask(taskId: string): Promise<pkg.google.longrunning.Operation> {
		const operations = await this.client.operationsClient.getOperation(
			pkg.google.longrunning.GetOperationRequest.create({ name: taskId })
		);

		return operations[0]
	}

	async dropFile(filename: string) {
		await this.storageClient.bucket(this.bucketName).file(filename).delete();
	}
}