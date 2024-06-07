export type OutputFormat = 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';

export const OnPaymentSuccessed = async (
	files: {file: File, language: string, fileName: string, outputFormat: OutputFormat}[],
	checkoutId: string,
	orderId: string
) => {
	const formData = new FormData();
	files.forEach((item, index) => {
		formData.append(`files[${index}]`, item.file)
		formData.append(`languages[${index}]`, item.language)
		formData.append(`fileNames[${index}]`, item.fileName)
		formData.append(`outputFormat[${index}]`, item.outputFormat)
	});

	formData.append('checkoutId', checkoutId);
	formData.append('orderId', orderId);

	const response = await fetch('/api/paymentSuccessed', {
		method: 'POST',
		body: formData,
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		}
	});

	return response.json();
}