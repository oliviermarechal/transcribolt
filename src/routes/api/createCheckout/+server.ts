import { App } from 'core/app/app';
import { json } from '@sveltejs/kit';
import { CreateCheckoutUseCase } from 'core/usecases';

const app = App.getInstance();

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	const body = await request.json();
	const price = body['price'];
	const email = body['email'];
	const createCheckoutUseCase = app.getUseCase(CreateCheckoutUseCase.name);
	const { success, checkout, error } = await createCheckoutUseCase.handle(price, email);

	return json({ success, checkout, error });
}
