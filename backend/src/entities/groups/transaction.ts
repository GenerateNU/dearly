import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { groupsTable } from "../schema";
import { CreateGroupPayLoad, Group } from "./validator";

export interface GroupTransaction {
    insertGroup(payload: CreateGroupPayLoad): Promise<Group | null>;
}

export class GroupTransactionImpl implements GroupTransaction {
    private db: PostgresJsDatabase;

    constructor(db: PostgresJsDatabase) {
        this.db = db;
    }

    async insertGroup(payload: CreateGroupPayLoad): Promise<Group | null> {
        const result = await this.db.insert(groupsTable).values(payload).returning();
        return result[0] ?? null;
    }
}