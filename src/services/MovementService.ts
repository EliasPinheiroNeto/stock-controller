import { Pool } from "pg";
import { MovementCreateSchema, MovementSchema } from "../schemas/movementSchema";
import { ItemSchema } from "../schemas/itemSchema";

export default class MovementService {
  private conn: Pool;

  constructor(conn: Pool) {
    this.conn = conn;
  }

  public async findAll() {
    try {
      const result = await this.conn.query<MovementSchema>(`SELECT * FROM stock_movements`);
      return result.rows;
    } catch (err) {
      console.error("Error fetching all movements:", err);
      return [];
    }
  }

  public async findAllByUser(userId: number) {
    try {
      const result = await this.conn.query<MovementSchema>(
        `SELECT * FROM stock_movements WHERE user_id = $1`,
        [userId]
      );
      return result.rows;
    } catch (err) {
      console.error(`Error fetching movements for user ${userId}:`, err);
      return [];
    }
  }

  public async findAllByItem(id: number) {
    try {
      const result = await this.conn.query<MovementSchema>(
        `SELECT * FROM stock_movements WHERE item_id = $1`,
        [id]
      );
      return result.rows;
    } catch (err) {
      console.error(`Error fetching movements for item ${id}:`, err);
      return [];
    }
  }

  public async insert(userId: number, data: MovementCreateSchema, employee_id?: number) {
    try {
      const values = (await Promise.all(data.items.map(async (item) => {
        const movementType = item.movement_type === 'IN' ? 1 : 2;
        const stockResult = await this.conn.query<ItemSchema>(
          `SELECT * FROM items WHERE id = $1 AND user_id = $2`,
          [item.item_id, userId]
        );

        if (stockResult.rowCount === 0) {
          return null;
        }

        if (movementType === 2 && stockResult.rows[0].stock < item.quantity) {
          return null;
        }

        await this.conn.query<ItemSchema>(
          `UPDATE items SET stock = $1 WHERE id = $2`,
          [stockResult.rows[0].stock + (movementType === 1 ? item.quantity : -item.quantity), item.item_id]
        );

        return `(${userId}, ${item.item_id}, ${movementType}, ${item.quantity}${employee_id ? `, ${employee_id}` : ''})`;
      }))).filter(Boolean);

      if (values.length === 0) {
        return [];
      }

      const result = await this.conn.query<ItemSchema>(
        `INSERT INTO stock_movements(user_id, item_id, movement_type_id, quantity${employee_id ? ', employee_id' : ''})
         VALUES ${values.join(', ')}
         RETURNING *`
      );

      await this.conn.query(
        `INSERT INTO feed(user_id, employee_id, feed_type_id, movement_id)
         VALUES ($1, $2, $3, $4)`,
        [userId, employee_id, 1, result.rows[0].id]
      );

      return result.rows;
    } catch (err) {
      console.error("Error inserting movement:", err);
      return [];
    }
  }
}