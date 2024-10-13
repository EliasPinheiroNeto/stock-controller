import { Pool } from "pg";
import { CategoryCreateSchema, CategorySchema, CategoryUpdateSchema } from "../schemas/categorySchema";

export default class CategoryService {
    private conn: Pool

    constructor(conn: Pool) {
        this.conn = conn
    }

    public async findAll() {
        const result = await this.conn.query<CategorySchema>(`--sql
            SELECT
                id,
                name,
                description,
                user_id,
                employee_id,
                created_at,
                updated_at
            FROM categories
        `)

        return result.rows
    }

    public async findAllByStockId(id: number) {
        const result = await this.conn.query<CategorySchema>(`--sql
            SELECT
                id,
                name,
                description,
                user_id,
                employee_id,
                created_at,
                updated_at
            FROM categories
            WHERE user_id = $1
        `, [id])

        return result.rows
    }

    public async findByID(id: number) {
        const result = await this.conn.query<CategorySchema>(`--sql
            SELECT
                id,
                name,
                description,
                user_id,
                employee_id,
                created_at,
                updated_at
            FROM categories
            WHERE id = $1
        `, [id])

        if (result.rowCount == 0) {
            throw new Error()
        }

        return result.rows[0]
    }

    public async insert(user_id: number, data: CategoryCreateSchema) {
        const result = await this.conn.query<CategorySchema>(`--sql
            INSERT INTO categories(user_id, name, description, employee_id)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [user_id, data.name, data.description, data.employee_id])

        return result.rows[0]
    }

    public async update(id: number, data: CategoryUpdateSchema) {
        const setClauses: string[] = [];
        const values: any[] = [id];

        if (data.name) {
            setClauses.push(`name = $${values.length + 1}`);
            values.push(data.name);
        }

        if (data.description) {
            setClauses.push(`name = $${values.length + 1}`);
            values.push(data.description);
        }

        if (setClauses.length == 0) {
            return {}
        }

        const query = `--sql
            UPDATE categories
            SET ${setClauses.join(', ')}
            WHERE id = $1
        RETURNING *;
        `;

        const result = await this.conn.query<CategorySchema>(query, values);

        return result.rows[0]
    }

    public async delete(id: number) {
        const result = await this.conn.query<CategorySchema>(`--sql
            DELETE FROM categories
            WHERE id = $1
            RETURNING *
        `, [id]);

        if (result.rowCount == 0) {
            throw new Error("Category not found")
        }

        return result.rows[0]
    }
}