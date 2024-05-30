export const OnPaymentSuccessed = async (
	files: {file: File, language: string, fileName: string}[],
	email: string,
	checkoutId: string,
	orderId: string
) => {
	const formData = new FormData();
	files.forEach((item, index) => {
		formData.append(`files[${index}]`, item.file);
		formData.append(`languages[${index}]`, item.language);
		formData.append(`fileNames[${index}]`, item.fileName);
	});

	formData.append('email', email);
	formData.append('checkoutId', checkoutId);
	formData.append('orderId', orderId);

	const response = await fetch('/api/paymentSuccessed', {
		method: 'POST',
		body: formData,
		headers: {
			'Accept': 'application/json',
		}
	});

	return response.json();
}