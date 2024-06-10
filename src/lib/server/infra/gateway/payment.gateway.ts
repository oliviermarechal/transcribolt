import { type NewCheckout, lemonSqueezySetup, createCheckout, getOrder } from '@lemonsqueezy/lemonsqueezy.js';
import { type PaymentGatewayInterface } from '../../domain/gateway';
import { LEMON_SQUEEZE_TEST_MODE } from '$env/static/private'

export class PaymentGateway implements PaymentGatewayInterface {
	constructor(
		private readonly lemonSqueezeApiKey: string,
	) {
		lemonSqueezySetup({apiKey: this.lemonSqueezeApiKey});
	}

	async createCheckout(price: number, email: string): Promise<{
		success: boolean,
		error?: string,
		checkout?: {
			url: string,
			id: string,
		}
	}> {
		const newCheckout: NewCheckout = {
			customPrice: Number(price.toFixed(2)) * 100,
			checkoutData: {
				email: email,
				name: 'transcription',
			},
			expiresAt: null,
			testMode: Boolean(LEMON_SQUEEZE_TEST_MODE),
		};

		const { statusCode, error, data } = await createCheckout('89660', '384696', newCheckout);

		if (!error) {
			return {
				success: true,
				checkout: {
					url: data.data.attributes.url,
					id: data.data.id,
				}
			};
		}

		return { success: false, error: error.message };
	}

	async checkPaymentSuccess(id: string): Promise<boolean> {
		const response = await getOrder(id);

		return response.data?.data.attributes.status === 'paid';
	}
}