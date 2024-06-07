import type { Generated } from 'kysely';

export interface TranscriptionRequestTable {
	id: Generated<string>;
	email: string;
	created_at?: Date;
	checkout_id: string | null;
	order_id?: string | null;
	price: number;
	status: string | null;
}

export interface TranscriptionRequestItemTable {
	id: Generated<string>;
	transcription_id: string;
	file_name: string;
	output_format: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';

	// IF output_format === verbose_json (So display Subtitle format (vtt or srt), text format, json format or verbose_format)
	timestamp_granularity?: string; // (word | segment)
}

