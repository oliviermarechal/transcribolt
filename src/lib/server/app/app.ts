import type { UseCaseInterface } from '../domain/interfaces';
import { Kysely, PostgresDialect } from 'kysely';
import { type Database } from './database/database';
import pg from 'pg';

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
            const dialect = new PostgresDialect({
                pool: new pg.Pool({
                    database: process.env.DB_NAME,
                    host: process.env.DB_HOST,
                    user: process.env.DB_USER,
                    password: process.env.DB_PASSWORD,
                    port: 5434,
                    max: 10,
                })
            })

            App.db = new Kysely<Database>({
                dialect,
            })
        }

        return App.db;
    }
}