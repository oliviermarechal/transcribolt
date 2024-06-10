import type { UseCaseInterface } from '../domain/interfaces';
import { type PaymentGatewayInterface } from '../domain/gateway';
import { v4 as uuidv4 } from 'uuid';
import { App } from '../app/app';

export class CreateCheckoutUseCase implements UseCaseInterface {
	constructor(
		private readonly paymentGateway: PaymentGatewayInterface,
	) {}

	async handle(price: number, email: string): Promise<{ success: boolean, checkout?: {url: string, id: string}, error?: string }> {
		const result = await this.paymentGateway.createCheckout(price, email);
		if (result.success) {
			await App.getDb()
				.insertInto('transcription_request')
				.values({
					id: uuidv4(),
					email: email,
					price: price,
					status: 'new',
					checkout_id: result.checkout?.id,
				})
				.execute();
		}

		return result;
	}
}
