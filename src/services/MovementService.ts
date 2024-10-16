import { Pool, } from "pg"
import { MovementCreateSchema, MovementSchema } from "../schemas/movementSchema"
import { ItemSchema } from "../schemas/itemSchema"

export default class MovementService {
    private conn: Pool

    constructor(conn: Pool) {
        this.conn = conn
    }

    public async findAll() {
        try {
            return (await this.conn.query<MovementSchema>(`--sql
                SELECT * FROM stock_movements    
            `)).rows
        } catch (err) {
            console.log(err)
            return []
        }
    }

    public async findAllByUser(userId: number) {
        try {
            return (await this.conn.query<MovementSchema>(`--sql
                SELECT * FROM stock_movements
                WHERE user_id = $1
            `, [userId])).rows
        } catch (err) {
            console.log(err)
            return []
        }
    }

    public async insert(userId: number, data: MovementCreateSchema, employee_id?: number) {

        try {
            const values = (await Promise.all(data.items.map(async (item) => {
                const movementType = item.movement_type == 'IN' ? 1 : 2

                const stockResult = await this.conn.query<ItemSchema>(`--sql
                    SELECT * FROM items WHERE id = $1 AND user_id = $2
                    `, [item.item_id, userId])

                if (stockResult.rowCount == 0) {
                    return
                }

                if (movementType == 2 && stockResult.rows[0].stock < item.quantity) {
                    return
                }

                const updateResult = await this.conn.query<ItemSchema>(`--sql
                    UPDATE items SET stock = ${stockResult.rows[0].stock + (movementType == 1 ? (item.quantity) : (-item.quantity))}
                    WHERE id = $1    
                `, [item.item_id])

                return (`(${userId}, ${item.item_id}, ${movementType}, ${item.quantity} 
                    ${employee_id ? ', ' + employee_id : ''})`)
            }))).filter(e => e)


            if (values.length <= 0) {
                return []
            }

            const result = await this.conn.query<ItemSchema>(`--sql
                INSERT INTO stock_movements(user_id, item_id, movement_type_id, quantity 
                    ${employee_id ? ', ' + employee_id : ''})
                VALUES ${values.join(', ')}
                RETURNING *
            `)

            return result.rows
        } catch (err) {
            console.log(err)
            return []
        }
    }
}