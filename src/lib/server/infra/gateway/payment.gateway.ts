import { type PaymentGatewayInterface } from '../../domain/gateway';
import Stripe from 'stripe';
import { env } from '$env/dynamic/private';

export class PaymentGateway implements PaymentGatewayInterface {
	private clientStripe: Stripe;
	constructor() {
		this.clientStripe = new Stripe(env.STRIPE_SECRET_KEY as string);
	}

	async createCheckout(
		price: number,
		email: string,
	): Promise<{ clientSecret: string | null; id: string }> {
		const paymentIntent = await this.clientStripe.paymentIntents.create({
			amount: price,
			currency: 'usd',
			automatic_payment_methods: {
				enabled: true,
			},
		});

		return { clientSecret: paymentIntent.client_secret, id: paymentIntent.id };
	}

	async checkPaymentSuccess(paymentIntentId: string): Promise<boolean> {
		const payment = await this.clientStripe.paymentIntents.retrieve(paymentIntentId);

		return payment.status === 'succeeded';
	}

	async refund(paymentId: string): Promise<void> {
		await this.clientStripe.refunds.create({ payment_intent: paymentId });
	}
}
