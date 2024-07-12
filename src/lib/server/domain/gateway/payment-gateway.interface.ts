export interface PaymentGatewayInterface {
	createCheckout(
		price: number,
		email: string,
	): Promise<{ clientSecret: string | null; id: string }>;
	checkPaymentSuccess(id: string): Promise<boolean>;
	refund(paymentId: string): Promise<void>;
}
