import { createKysely } from '@vercel/postgres-kysely';
import {
	type TranscriptionRequestItemTable,
	type TranscriptionRequestTable,
} from './schema';

export interface Database {
	transcription_request: TranscriptionRequestTable,
	transcription_request_item: TranscriptionRequestItemTable,
}

export const db = createKysely<Database>();