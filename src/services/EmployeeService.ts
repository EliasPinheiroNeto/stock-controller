import { Pool } from "pg";
import AuthService from "./AuthService";
import { EmployeeCreateSchema, EmployeeFullSchema, EmployeeLoginSchema, EmployeeSchema, EmployeeUpdateSchema } from "../schemas/employeeSchema";

export default class EmployeeService {
    private conn: Pool

    constructor(conn: Pool) {
        this.conn = conn
    }

    public async findAll() {
        const result = await this.conn.query<EmployeeSchema>(`--sql
            SELECT
                id,
                name,
                user_id,
                created_at,
                updated_at
            FROM employees
        `)

        return result.rows
    }

    public async findByID(id: number) {
        const result = await this.conn.query<EmployeeSchema>(`--sql
            SELECT
                id,
                name,
                user_id,
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

    public async insert(userId: number, data: EmployeeCreateSchema) {
        const hashedPassword = await AuthService.hashPassword(data.password)

        const result = await this.conn.query<EmployeeSchema>(`--sql
            INSERT INTO employees(name, user_id, password)
            VALUES ($1, $2, $3)
            RETURNING id, name, user_id, created_at, updated_at
        `, [data.name, userId, hashedPassword])

        return result.rows[0]
    }

    public async update(id: number, data: EmployeeUpdateSchema) {
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
            UPDATE employees
            SET ${setClauses.join(', ')}
            WHERE id = $1
        RETURNING id, name, user_id, created_at, updated_at;
        `;

        const result = await this.conn.query<EmployeeSchema>(query, values);

        return result.rows[0]
    }

    public async delete(id: number) {
        const result = await this.conn.query<EmployeeFullSchema>(`--sql
            DELETE FROM employees
            WHERE id = $1
            RETURNING *
        `, [id]);

        if (result.rowCount == 0) {
            throw new Error("Employee not found")
        }

        return result.rows[0]
    }

    public async validateLogin(data: EmployeeLoginSchema) {
        const result = await this.conn.query<EmployeeFullSchema>(`--sql
            SELECT
                id,
                name,
                user_id,
                password,
                created_at,
                updated_at
            FROM employees
            WHERE id = $1
        `, [data.id])

        if (result.rowCount == 0) {
            throw new Error()
        }

        const { password, ...user } = result.rows[0]

        if (!(await AuthService.verifyPassword(data.password, password))) {
            throw new Error()
        }

        return user
    }
}