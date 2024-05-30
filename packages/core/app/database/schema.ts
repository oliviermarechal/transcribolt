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
	gcs_file_name: string;
	task_id: string | null;
	done: boolean;
}

