import { Pool } from "pg";

export default class DatabaseService {
    protected conn: Pool

    constructor(conn: Pool) {
        this.conn = conn
    }
}