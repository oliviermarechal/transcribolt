import { json } from '@sveltejs/kit';
import { CreateCheckoutUseCase } from '$lib/server/usecases';
import { App } from '$lib/server/app/app';

const app = App.getInstance();

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	const body = await request.json();
	const price = body['price'];
	const email = body['email'];

	const createCheckoutUseCase = app.getUseCase<CreateCheckoutUseCase>(CreateCheckoutUseCase.name);
	const { clientSecret, id } = await createCheckoutUseCase.handle(price, email);

	return json({ clientSecret, checkoutId: id });
}
