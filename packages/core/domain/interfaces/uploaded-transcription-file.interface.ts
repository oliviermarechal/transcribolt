export interface UploadedTranscriptionFileInterface {
	buffer: Buffer;
	language: string;
	name: string;
	outputFormat: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
	timestampGranularity?: 'word' | 'segment';
}