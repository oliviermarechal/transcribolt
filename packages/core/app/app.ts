import type { UseCaseInterface } from '../domain/interfaces';
import { Kysely } from 'kysely';
import { type Database, db } from './database/database';

export class App {
    private static instance: App;
    private static db: Kysely<Database>;

    private useCases = new Map<string, UseCaseInterface>();

    public registerUseCase(key: string, useCase: UseCaseInterface) {
        this.useCases.set(key, useCase);
    }

    getUseCase(key: string): UseCaseInterface {
        const usecase = this.useCases.get(key);
        if (usecase) {
            return usecase;
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
            App.db = db;
        }

        return App.db;
    }
}