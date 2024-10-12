import { Pool } from "pg";
import { UserCreateSchema, UserSchema, UserUpdateSchema } from "../schemas/userSchema";
import AuthService from "./AuthService";

export default class UserService {
    private conn: Pool

    constructor(conn: Pool) {
        this.conn = conn
    }

    public async findAll() {
        const result = await this.conn.query<UserSchema>(`--sql
            SELECT
                id,
                name,
                email,
                created_at,
                updated_at
            FROM users
        `)

        return result.rows
    }

    public async findByID(id: number) {
        const result = await this.conn.query<UserSchema>(`--sql
            SELECT
                id,
                name,
                email,
                created_at,
                updated_at
            FROM users
            WHERE id = $1
        `, [id])

        if (result.rowCount == 0) {
            throw new Error()
        }

        return result.rows[0]
    }

    public async insert(data: UserCreateSchema) {
        const hashedPassword = await AuthService.hashPassword(data.password)

        const result = await this.conn.query<UserSchema>(`--sql
            INSERT INTO users(name, email, password)
            VALUES ($1, $2, $3)
            RETURNING id, name, email, created_at, updated_at
        `, [data.name, data.email, hashedPassword])

        return result.rows[0]
    }

    public async update(id: number, data: UserUpdateSchema) {
        const setClauses: string[] = [];
        const values: any[] = [id];

        if (data.name) {
            setClauses.push(`name = $${values.length + 1}`);
            values.push(data.name);
        }

        if (setClauses.length === 0) {
            return {}
        }

        const query = `--sql
            UPDATE users
            SET ${setClauses.join(', ')}
            WHERE id = $1
        RETURNING id, name, email, created_at, updated_at;
        `;

        const result = await this.conn.query<UserSchema>(query, values);

        return result.rows[0]
    }
}