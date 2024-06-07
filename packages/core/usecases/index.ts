import { App } from '../app/app';
import { CreateCheckoutUseCase } from './create-checkout.use-case';
import { PaymentGateway } from '../infra/gateway/payment.gateway';
import dotenv from 'dotenv';
import { ProcessingTranscriptionUseCase } from './processing-transcription.use-case';
import { TranscriptorGateway } from '../infra/gateway/transcriptor.gateway';

if (process.env.NODE_ENV !== 'production') {
	dotenv.config();
}

export * from './create-checkout.use-case';
export * from './processing-transcription.use-case';

const paymentGateway = new PaymentGateway(process.env.PRIVATE_LEMON_SQUEEZE_API_KEY as string);

const app = App.getInstance();
app.registerUseCase(
	CreateCheckoutUseCase.name,
	new CreateCheckoutUseCase(paymentGateway)
)
app.registerUseCase(
	ProcessingTranscriptionUseCase.name,
	new ProcessingTranscriptionUseCase(
		paymentGateway,
		new TranscriptorGateway()
	)
)