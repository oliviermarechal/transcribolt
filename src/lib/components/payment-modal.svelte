<script lang="ts">
	import { onMount } from 'svelte';
	import { loadStripe } from '@stripe/stripe-js';
	import { env } from '$env/dynamic/public'
	import { Button } from "$lib/components/ui/button";

	export let clientSecret: string;
	export let onPaymentSuccess: Function;
	export let onPaymentCancelled: Function;

	let stripe: any;
	let elements: any;

	onMount(async () => {
		stripe = await loadStripe(env.PUBLIC_STRIPE_PUBLIC_KEY);
		if (stripe) {
			elements = stripe.elements({
				appearance: {
					theme: 'night',
					labels: 'floating',
				},
				clientSecret: clientSecret,
			});

			const paymentElement = elements.create("payment");
			paymentElement.mount("#payment-element");
		}
	});

	async function handleSubmit(event: Event) {
		event.preventDefault();
		const result = await stripe.confirmPayment({
			elements,
			redirect: 'if_required',
		});

		if (result.error) {
			onPaymentCancelled(result.error);
		} else {
			onPaymentSuccess(result.paymentIntent.id); // Retrieve with paymentIntent.id the transcription request in database
		}
	}
</script>

<form on:submit={handleSubmit}>
	<div id="payment-element"><!-- A Stripe Element will be inserted here. --></div>
	<Button type="submit">Payer</Button>
</form>