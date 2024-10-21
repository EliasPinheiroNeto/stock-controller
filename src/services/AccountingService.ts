import { DatabaseError } from "pg";
import ApplicationError from "../applicationError";
import DatabaseService from "./DatabaseService";
import { ItemSchema } from "../schemas/itemSchema";

export default class AccountingService extends DatabaseService {
    public async getMediumPrice(id: number) {
        const item = await this.conn.query<ItemSchema>(`--sql
            SELECT *
            FROM items
            WHERE id = $1
        `, [id])

        if (item.rowCount === 0) {
            throw new ApplicationError("Item not found", {
                status: 404,
                errorCode: "NOT_FOUND",
                message: "Item não encontrado"
            })
        }

        try {
            const result = await this.conn.query<{ preco_medio: number }>(`--sql
            WITH entradas AS (
                -- Considera apenas as entradas (movement_type_id = 1) para o cálculo do preço médio
                SELECT
                    item_id,
                    SUM(quantity) AS quantidade_total,
                    SUM(quantity * price) AS valor_total
                FROM stock_movements
                WHERE item_id = $1 AND movement_type_id = 1
                GROUP BY item_id
            ),
            saldo_estoque AS (
                -- Calcula o saldo atual do estoque considerando tanto entradas quanto saídas
                SELECT
                    item_id,
                    SUM(CASE WHEN movement_type_id = 1 THEN quantity ELSE -quantity END) AS saldo_estoque
                FROM stock_movements
                WHERE item_id = $1
                GROUP BY item_id
            )
            SELECT
                CASE
                    -- O preço médio é calculado apenas se houver saldo de estoque
                    WHEN saldo_estoque.saldo_estoque > 0 THEN
                        entradas.valor_total / entradas.quantidade_total
                    ELSE 0
                END AS preco_medio
            FROM entradas
            JOIN saldo_estoque ON entradas.item_id = saldo_estoque.item_id;
        `, [id])


            return {
                ...item.rows[0],
                medium_price: result.rows[0].preco_medio
            }
        } catch (err) {
            if (err instanceof DatabaseError) {
                throw new ApplicationError("Database error", {
                    status: 500,
                    errorCode: "DATABASE_ERROR",
                    message: "Erro ao calcular preço médio"
                })
            }

            throw err
        }
    }
}