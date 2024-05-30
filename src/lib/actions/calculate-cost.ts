export const calculateCost = async (file: File): Promise<{duration: number,cost: number}> => {
	const formData = new FormData();
	formData.append('file', file);
	const response = await fetch('/api/calculateCost', {
		method: 'POST',
		body: formData,
		headers: {
			'Accept': 'application/json',
		}
	});

	return response.json();
}