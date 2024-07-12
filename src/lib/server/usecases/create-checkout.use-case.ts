import type { UseCaseInterface } from '../domain/interfaces';
import { type PaymentGatewayInterface } from '../domain/gateway';
import { v4 as uuidv4 } from 'uuid';
import { App } from '../app/app';

export class CreateCheckoutUseCase implements UseCaseInterface {
	constructor(private readonly paymentGateway: PaymentGatewayInterface) {}

	async handle(
		price: number,
		email: string,
	): Promise<{ clientSecret: string | null; id: string }> {
		const result = await this.paymentGateway.createCheckout(price, email);
		await App.getDb()
			.insertInto('transcription_request')
			.values({
				id: uuidv4(),
				email: email,
				price: price,
				status: 'new',
				checkout_id: result.id,
			})
			.execute();

		return { clientSecret: result.clientSecret, id: result.id };
	}
}
