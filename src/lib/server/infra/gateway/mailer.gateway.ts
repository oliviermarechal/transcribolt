import type { MailerGatewayInterface } from '../../domain/gateway';
import { Resend } from 'resend';
import { RESEND_API_KEY } from '$env/static/private'

export class MailerGateway implements MailerGatewayInterface {
	private readonly client: Resend;

	constructor() {
		this.client = new Resend(RESEND_API_KEY);
	}

	async sendTranscriptionResult(email: string, transcriptions: { fileName: string, buffer: Buffer }[]): Promise<void> {
		const attachments = transcriptions.map(t => {
			return { content: t.buffer, filename: t.fileName }
		})

		await this.client.emails.send({
			from: 'Acme <onboarding@resend.dev>',
			to: email,
			subject: 'Transcription',
			attachments: attachments,
			html: `<h1>Result of your transcription</h1><p>You can find the result of the transcription of your files in attachments</p>`
		})
	}
}