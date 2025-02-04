import { PostgresJsDatabase } from "drizzle-orm/postgres-js";

export interface NudgeTransaction {

}

export class NudgeTransactionImpl implements NudgeTransaction {
    private db: PostgresJsDatabase;

    constructor(db: PostgresJsDatabase) {
        this.db = db;
    }

    
}