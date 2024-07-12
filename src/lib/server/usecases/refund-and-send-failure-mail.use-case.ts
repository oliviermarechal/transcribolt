import type { UseCaseInterface } from '../domain/interfaces';
import { type PaymentGatewayInterface } from '../domain/gateway';
import { App } from '../app/app';

export class RefundAndSendFailureMailUseCase implements UseCaseInterface {
	constructor(private readonly paymentGateway: PaymentGatewayInterface) {}

	async handle(paymentIntentId: string): Promise<void> {
		await this.paymentGateway.refund(paymentIntentId);
		await App.getDb()
			.updateTable('transcription_request')
			.set({ status: 'fail' })
			.where('checkout_id', '=', paymentIntentId)
			.execute();

		// Send email ?
		return;
	}
}
