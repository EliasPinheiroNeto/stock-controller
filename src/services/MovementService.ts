import { MovementCreateSchema, MovementSchema } from "../schemas/movementSchema";
import { ItemSchema } from "../schemas/itemSchema";
import DatabaseService from "./DatabaseService";
import { DatabaseError } from "pg";
import ApplicationError from "../applicationError";

export default class MovementService extends DatabaseService {

  public async findAll() {
    const result = await this.conn.query<MovementSchema>(`SELECT * FROM stock_movements`);
    return result.rows;
  }

  public async findByID(id: number) {
    const result = await this.conn.query<MovementSchema>(
      `SELECT s.*, i.name as item_name
      FROM stock_movements s
      JOIN items i ON i.id = s.item_id
      WHERE s.id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      throw new ApplicationError("Movement not found", {
        status: 404,
        errorCode: "NOT_FOUND",
        message: "Movimento não encontrado"
      });
    }

    return result.rows[0];
  }

  public async findAllByUser(userId: number) {
    const result = await this.conn.query<MovementSchema>(
      `SELECT * FROM stock_movements WHERE user_id = $1`,
      [userId]
    );
    return result.rows;
  }

  public async findAllByItem(id: number) {
    const result = await this.conn.query<MovementSchema>(
      `SELECT * FROM stock_movements WHERE item_id = $1`,
      [id]
    );
    return result.rows;
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

        return `(${userId}, ${item.item_id}, ${movementType}, ${item.quantity}${employee_id ? `, ${employee_id}` : ''}, ${item.price})`;
      }))).filter(Boolean);

      if (values.length === 0) {
        return [];
      }

      const result = await this.conn.query<ItemSchema>(
        `INSERT INTO stock_movements(user_id, item_id, movement_type_id, quantity${employee_id ? ', employee_id' : ''}, price)
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
      if (err instanceof DatabaseError) {
        console.error(err)
        throw new ApplicationError("Error on inserting moviment", {
          status: 500,
          errorCode: "DATABASE_ERROR",
          message: "Erro interno",
          details: err.detail
        })
      }

      throw err
    }
  }
}