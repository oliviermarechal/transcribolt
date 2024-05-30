import ffprobeStatic from 'ffprobe-static';
import ffprobe from 'ffprobe';
import fs from 'fs';
import path from 'path';
import type { UseCaseInterface } from '../domain/interfaces';

export class CalculateCostUseCase implements UseCaseInterface {
	private priceByMinute = 0.07;

	async handle(uploadedFile: {
		originalFilename: string;
		type: string;
		buffer: Buffer;
	}): Promise<{ duration: number, cost: number }> {
		const tmpFilepath = path.join('/tmp/', uploadedFile.originalFilename);

		fs.writeFileSync(tmpFilepath, uploadedFile.buffer);
		const duration = await this.getDuration(tmpFilepath);
		const minutes = Math.floor(duration / 60);
		const extraSeconds = duration % 60;

		const pricePerSecond = this.priceByMinute / 60;
		const priceForExtraSeconds = extraSeconds * pricePerSecond;

		return {
			cost: Math.ceil(((minutes * this.priceByMinute + priceForExtraSeconds) + Number.EPSILON) * 100) / 100,
			duration,
		};
	}

	async getDuration(filePath: string): Promise<number> {
		return new Promise((resolve, reject) => {
			ffprobe(filePath, { path: ffprobeStatic.path }, (err, info) => {
				if (err) {
					fs.unlinkSync(filePath);
					reject(`Error extracting metadata from ${filePath}: ${err.message}`);
				} else {
					fs.unlinkSync(filePath);
					if (info.streams[0].duration) {
						const duration = parseFloat(info.streams[0].duration);
						resolve(Math.ceil(duration));
					} else {
						reject('No duration found');
					}
				}
			});
		});
	}
}
