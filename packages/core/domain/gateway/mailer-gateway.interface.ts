export interface MailerGatewayInterface {
	sendTranscriptionResult(email: string, transcriptions: { fileName: string, buffer: Buffer }[]): Promise<void>;
}