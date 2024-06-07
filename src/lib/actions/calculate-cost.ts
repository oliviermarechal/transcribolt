export const calculateCost = async (file: File): Promise<{duration: number, cost: number}> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = () => {
			const media = document.createElement(file.type.startsWith('audio') ? 'audio' : 'video');
			media.src = reader.result as string;

			media.onloadedmetadata = () => {
				const duration = Number(media.duration.toFixed());
				const cost = calculateCostFromDuration(duration);
				resolve({ duration, cost });
			};

			media.onerror = (error) => {
				reject(new Error('Erreur lors du chargement des métadonnées'));
			};
		};

		reader.onerror = (error) => {
			reject(new Error('Erreur lors de la lecture du fichier'));
		};

		reader.readAsDataURL(file);
	});

	function calculateCostFromDuration(duration: number): number {
		const durationInMinutes = duration / 60;
		const cost = durationInMinutes * 0.07;

		return Math.ceil(cost * 100) / 100;
	}
}