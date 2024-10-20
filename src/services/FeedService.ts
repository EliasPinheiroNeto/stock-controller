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
        `)

        return result.rows
    }

    public async findByID(id: number) {
        const result = await this.conn.query<FeedSchema>(`--sql
            SELECT *
            FROM feed
            WHERE id = $1
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
        `, [userId])

        return result.rows
    }

    public async findByEmployeeID(employeeId: number) {
        const result = await this.conn.query<FeedSchema>(`--sql
            SELECT *
            FROM feed
            WHERE employee_id = $1
        `, [employeeId])

        return result.rows
    }

    public async findByItemID(itemId: number) {
        const result = await this.conn.query<FeedSchema>(`--sql
            SELECT *
            FROM feed
            WHERE item_id = $1
        `, [itemId])

        return result.rows
    }

    public async findByCategoryID(categoryId: number) {
        const result = await this.conn.query<FeedSchema>(`--sql
            SELECT *
            FROM feed
            WHERE category_id = $1
        `, [categoryId])

        return result.rows
    }

    public async insert(data: FeedSchema) {
        const result = await this.conn.query<FeedSchema>(`--sql
            INSERT INTO feed(created_at, user_id, employee_id, feed_type_id, item_id, category_id, movement_id, description)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `, [data.created_at, data.user_id, data.employee_id, data.feed_type_id, data.item_id, data.category_id, data.movement_id, data.description])

        return result.rows[0]
    }
}