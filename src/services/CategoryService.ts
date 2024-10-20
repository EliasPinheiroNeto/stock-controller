import { Pool } from "pg";
import { CategoryCreateSchema, CategorySchema, CategoryUpdateSchema } from "../schemas/categorySchema";

export default class CategoryService {
    private conn: Pool

    constructor(conn: Pool) {
        this.conn = conn
    }

    public async findAll() {
        const result = await this.conn.query<CategorySchema>(`--sql
            SELECT *
            FROM categories
        `)

        return result.rows
    }

    public async findAllByStockId(id: number) {
        const result = await this.conn.query<CategorySchema>(`--sql
            SELECT *
            FROM categories
            WHERE user_id = $1
        `, [id])

        return result.rows
    }

    public async findByID(id: number) {
        const result = await this.conn.query<CategorySchema>(`--sql
            SELECT *
            FROM categories
            WHERE id = $1
        `, [id])

        if (result.rowCount == 0) {
            throw new Error()
        }

        return result.rows[0]
    }

    public async insert(user_id: number, data: CategoryCreateSchema, employee_id?: number) {
        const result = await this.conn.query<CategorySchema>(`--sql
            INSERT INTO categories(user_id, name, description, employee_id)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [user_id, data.name, data.description, data.employee_id])

        // Cria feed
        await this.conn.query(`--sql
            INSERT INTO feed(user_id, employee_id, feed_type_id, category_id, description)
            VALUES ($1, $2, $3, $4, $5)
        `, [user_id, employee_id, 1, result.rows[0].id, result.rows[0].description])

        return result.rows[0]
    }

    public async update(id: number, data: CategoryUpdateSchema, employee_id?: number) {
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

        // Cria feed
        await this.conn.query(`--sql
            INSERT INTO feed(user_id, employee_id, feed_type_id, category_id, description)
            VALUES ($1, $2, $3, $4, $5)
        `, [result.rows[0].user_id, employee_id, 2, result.rows[0].id, result.rows[0].description])

        return result.rows[0]
    }

    public async delete(id: number, employee_id?: number) {
        const result = await this.conn.query<CategorySchema>(`--sql
            DELETE FROM categories
            WHERE id = $1
            RETURNING *
        `, [id]);

        if (result.rowCount == 0) {
            throw new Error("Category not found")
        }

        // Cria feed
        await this.conn.query(`--sql
            INSERT INTO feed(user_id, employee_id, feed_type_id, category_id)
            VALUES ($1, $2, $3, $4, $5)
        `, [result.rows[0].user_id, employee_id, 3, result.rows[0].id])

        return result.rows[0]
    }
}