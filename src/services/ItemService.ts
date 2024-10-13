import { Pool } from "pg";
import { ItemCreateSchema, ItemSchema, ItemUpdateSchema } from "../schemas/itemSchema";
import { CategorySchema } from "../schemas/categorySchema";

export default class ItemService {
    private conn: Pool

    constructor(conn: Pool) {
        this.conn = conn
    }

    public async findAll() {
        const result = await this.conn.query<ItemSchema>(`--sql
            SELECT
                id,
                name,
                description,
                user_id,
                employee_id,
                created_at,
                updated_at
            FROM items
        `)

        return result.rows
    }

    public async findAllByStockId(id: number) {
        const result = await this.conn.query<ItemSchema>(`--sql
            SELECT
                id,
                name,
                description,
                user_id,
                employee_id,
                created_at,
                updated_at
            FROM items
            WHERE user_id = $1
        `, [id])

        return result.rows
    }

    public async findByID(id: number) {
        const result = await this.conn.query<ItemSchema>(`--sql
            SELECT
                id,
                name,
                description,
                user_id,
                employee_id,
                created_at,
                updated_at,
                stock
            FROM items
            WHERE id = $1
        `, [id])

        if (result.rowCount == 0) {
            throw new Error()
        }

        return result.rows[0]
    }

    public async insert(user_id: number, data: ItemCreateSchema) {
        const result = await this.conn.query<ItemSchema>(`--sql
            INSERT INTO items(user_id, name, description, employee_id)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [user_id, data.name, data.description, data.employee_id])



        const categoriesFound: number[] = []
        if (data.category_ids) {
            const categories = await this.conn.query<CategorySchema>(`--sql
                SELECT * FROM categories
                WHERE id IN $1
                RETURNING *
            `, [data.category_ids])

            if (categories.rowCount != 0) {
                categoriesFound.push(...categories.rows.map(e => e.id))
            }
        }

        categoriesFound.forEach(async e => {
            const reference = await this.conn.query(`--sql
                INSERT INTO item_category(item_id, category_id)
                VALUES($1, $2)    
            `, [result.rows[0].id, e])
        })

        return result.rows[0]
    }

    public async update(id: number, data: ItemUpdateSchema) {
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

        if (!data.category_ids && setClauses.length == 0) {
            return {}
        }

        const query = `--sql
            UPDATE items
            SET ${setClauses.join(', ')}
            WHERE id = $1
        RETURNING *;
        `;

        const result = await this.conn.query<ItemSchema>(query, values);

        if (!data.category_ids) {
            return result.rows[0]
        }

        await this.conn.query(`--sql
            DELETE FROM item_category
            WHERE item_id = $1 AND category_id NOT IN $2    
        `, [id, data.category_ids])

        const references = await this.conn.query<{ id: number, item_id: number, category_id: number }>(`--sql
            SELECT * FROM item_category
            WHERE item_id IN $1    
        `, [data.category_ids])

        const n = references.rows.filter(e => !(data.category_ids?.includes(e.id)))

        if (n.length == 0) {
            return result.rows[0]
        }

        await this.conn.query(`--sql
            INSERT INTO item_category(item_id, category_id)
            VALUES ${(n.map(e => { return `(${e.category_id})` })).join(', ')}
        `)

        return result.rows[0]
    }

    public async delete(id: number) {
        const result = await this.conn.query<ItemSchema>(`--sql
            DELETE FROM items
            WHERE id = $1
            RETURNING *
        `, [id]);

        if (result.rowCount == 0) {
            throw new Error("Item not found")
        }

        return result.rows[0]
    }
}