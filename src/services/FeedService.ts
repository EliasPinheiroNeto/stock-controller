import { Pool } from "pg"
import { FeedSchema } from "../schemas/feedSchema"

export default class FeedService {
    private conn: Pool

    constructor(conn: Pool) {
        this.conn = conn
    }

    public async findAll() {
        const result = await this.conn.query<FeedSchema>(`--sql
            SELECT *
            FROM feed
            ORDER BY created_at DESC
        `)

        return result.rows
    }

    public async findByID(id: number) {
        const result = await this.conn.query<FeedSchema>(`--sql
            SELECT *
            FROM feed
            WHERE id = $1
            ORDER BY created_at DESC
        `, [id])

        if (result.rowCount == 0) {
            throw new Error()
        }

        return result.rows[0]
    }

    public async findByUserID(userId: number) {
        const result = await this.conn.query<FeedSchema>(`--sql
            SELECT *
            FROM feed
            WHERE user_id = $1
            ORDER BY created_at DESC
        `, [userId])

        return result.rows
    }

    public async findByEmployeeID(employeeId: number) {
        const result = await this.conn.query<FeedSchema>(`--sql
            SELECT *
            FROM feed
            WHERE employee_id = $1
            ORDER BY created_at DESC
        `, [employeeId])

        return result.rows
    }

    public async findByItemID(itemId: number) {
        const result = await this.conn.query<FeedSchema>(`--sql
            SELECT *
            FROM feed
            WHERE item_id = $1
            ORDER BY created_at DESC
        `, [itemId])

        return result.rows
    }

    public async findByCategoryID(categoryId: number) {
        const result = await this.conn.query<FeedSchema>(`--sql
            SELECT *
            FROM feed
            WHERE category_id = $1
            ORDER BY created_at DESC
        `, [categoryId])

        return result.rows
    }
}