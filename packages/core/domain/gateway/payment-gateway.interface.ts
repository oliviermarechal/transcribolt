export interface PaymentGatewayInterface {
	createCheckout(price: number, email: string): Promise<{
		success: boolean,
		error?: string,
		checkout?: {
			url: string,
			id: string,
		}
	}>;
	checkPaymentSuccess(id: string): Promise<boolean>;
}