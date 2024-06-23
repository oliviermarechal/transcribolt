import { App } from '../app/app';
import { CreateCheckoutUseCase } from './create-checkout.use-case';
import { PaymentGateway } from '../infra/gateway/payment.gateway';
import dotenv from 'dotenv';
import { ProcessingTranscriptionUseCase } from './processing-transcription.use-case';
import { TranscriptorGateway } from '../infra/gateway/transcriptor.gateway';
import { env } from '$env/dynamic/private'

dotenv.config();

export * from './create-checkout.use-case';
export * from './processing-transcription.use-case';

const paymentGateway = new PaymentGateway();

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