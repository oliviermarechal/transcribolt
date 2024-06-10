import type { UseCaseInterface } from '../domain/interfaces';
import { Kysely } from 'kysely';
import { type Database } from './database/database';
import { createKysely } from '@vercel/postgres-kysely';

export class App {
    private static instance: App;
    private static db: Kysely<Database>;

    private useCases = new Map<string, UseCaseInterface>();

    public registerUseCase(key: string, useCase: UseCaseInterface) {
        this.useCases.set(key, useCase);
    }

    getUseCase<T>(key: string): T {
        const usecase = this.useCases.get(key);
        if (usecase) {
            return usecase as T;
        }

        throw new Error('Usecase not found');
    }

    public static getInstance(): App {
        if (!App.instance) {
            App.instance = new App();
        }
        return App.instance;
    }

    public static getDb(): Kysely<Database> {
        if (!App.db) {
            App.db = createKysely<Database>();
        }

        return App.db;
    }
}