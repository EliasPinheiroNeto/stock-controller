import {
    ItemCreateSchema,
    ItemSchema,
    ItemUpdateSchema,
} from "../schemas/itemSchema";
import { CategorySchema } from "../schemas/categorySchema";
import DatabaseService from "./DatabaseService";
import ApplicationError from "../applicationError";
import { DatabaseError } from "pg";

export default class ItemService extends DatabaseService {
    public async findAll() {
        const result = await this.conn.query<ItemSchema>(`--sql
            SELECT *, array(
                SELECT category_id
                FROM item_category
                WHERE item_id = i.id
            ) AS category_ids
            FROM items i
        `);

        return result.rows;
    }

    public async findAllWithNoCategory(userId?: number) {
        const result = await this.conn.query<ItemSchema>(`--sql
            SELECT i.*
            FROM items i
            LEFT JOIN item_category ic ON i.id = ic.item_id
            WHERE ic.item_id IS NULL
                ${userId ? "AND ic.user_id = " + userId : ""}
        `);

        return result.rows;
    }

    public async findAllByUser(id: number) {
        const result = await this.conn.query<ItemSchema>(
            `--sql
            SELECT *, array(
                SELECT category_id
                FROM item_category
                WHERE item_id = i.id
            ) AS category_ids
            FROM items i
            WHERE user_id = $1
        `,
            [id],
        );

        return result.rows;
    }

    public async findAllByCategory(id: number) {
        const result = await this.conn.query<ItemSchema>(
            `--sql
            SELECT i.*, array(
                SELECT category_id
                FROM item_category
                WHERE item_id = i.id
            ) AS category_ids
            FROM item_category ic
            JOIN items i ON i.id = ic.item_id
            WHERE ic.category_id = $1
        `,
            [id],
        );

        return result.rows;
    }

    public async findByID(id: number) {
        const result = await this.conn.query<ItemSchema>(
            `--sql
            SELECT *, array(
                SELECT category_id
                FROM item_category
                WHERE item_id = i.id
            ) AS category_ids
            FROM items i
            WHERE id = $1
        `,
            [id],
        );

        if (result.rowCount == 0) {
            throw new ApplicationError("Item not found", {
                status: 404,
                errorCode: "NOT_FOUND",
                message: "Item não encontrado",
            });
        }

        return result.rows[0];
    }

    public async insert(
        user_id: number,
        data: ItemCreateSchema,
        employee_id?: number,
    ) {
        // Verifica se o SKU já existe para esse usuário
        const sku = await this.conn.query<ItemSchema>(
            `--sql
            SELECT *
            FROM items
            WHERE user_id = $1 AND sku = $2
        `,
            [user_id, data.sku],
        );

        if (sku.rowCount !== null && sku.rowCount > 0) {
            throw new ApplicationError("SKU already exists", {
                status: 400,
                errorCode: "INVALID_DATA",
                message: "SKU já existe",
            });
        }

        try {
            // Cria o Item
            const item = await this.conn.query<ItemSchema>(
                `--sql
                INSERT INTO items(user_id, name, description, employee_id, sku)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `,
                [user_id, data.name, data.description, employee_id, data.sku],
            );

            // Encontra as categorias para ligar
            const categories = await this.conn.query<{ id: number }>(
                `--sql
                SELECT id
                FROM categories
                WHERE user_id = $1 AND id IN ($2)
            `,
                [user_id, data.category_ids?.join(", ")],
            );

            // Cria a ligação com a categoria
            categories.rows.forEach(async (id) => {
                await this.conn.query(
                    `--sql
                    INSERT INTO item_category(item_id, category_id)
                    VALUES($1, $2)    
                `,
                    [item.rows[0].id, id.id],
                );
            });

            // Cria o feed
            await this.conn.query(
                `--sql
                INSERT INTO feed(user_id, employee_id, feed_type_id, item_id, description, name)
                VALUES ($1, $2, $3, $4, $5, $6)
            `,
                [
                    user_id,
                    employee_id,
                    1,
                    item.rows[0].id,
                    item.rows[0].description,
                    item.rows[0].name,
                ],
            );

            return item.rows[0];
        } catch (err) {
            if (err instanceof DatabaseError) {
                console.error(err);
                throw new ApplicationError("Error on inserting item", {
                    status: 500,
                    errorCode: "DATABASE_ERROR",
                    message: "Erro interno",
                    details: err.detail,
                });
            }

            throw err;
        }
    }

    public async update(
        id: number,
        data: ItemUpdateSchema,
        employee_id?: number,
    ) {
        // Verifica se o item existe
        const item = await this.conn.query<ItemSchema>(
            `--sql
            SELECT *
            FROM items
            WHERE id = $1
        `,
            [id],
        );

        if (item.rowCount == 0) {
            throw new ApplicationError("Item not found", {
                status: 404,
                errorCode: "NOT_FOUND",
                message: "Item não encontrado",
            });
        }

        const setClauses: string[] = [];
        const values: any[] = [id];

        // Verifica se o SKU já existe para esse usuário
        if (data.sku) {
            const sku = await this.conn.query<ItemSchema>(
                `--sql
                SELECT *
                FROM items
                WHERE user_id = $1 AND sku = $2
            `,
                [item.rows[0].user_id, data.sku],
            );

            if (sku.rowCount !== null && sku.rowCount > 0) {
                throw new ApplicationError("SKU already exists", {
                    status: 400,
                    errorCode: "INVALID_DATA",
                    message: "SKU já existe",
                });
            }

            setClauses.push(`sku = $${values.length + 1}`);
            values.push(data.sku);
        }

        // Atualizando propriedades base do item
        if (data.name) {
            setClauses.push(`name = $${values.length + 1}`);
            values.push(data.name);
        }

        if (data.description) {
            setClauses.push(`description = $${values.length + 1}`);
            values.push(data.description);
        }

        try {
            if (data.category_ids) {
                // Deleta ligações
                if (data.category_ids.length == 0) {
                    await this.conn.query(
                        `--sql
                        DELETE FROM item_category
                        WHERE item_id = $1
                    `,
                        [id],
                    );
                } else {
                    await this.conn.query(
                        `--sql
                        DELETE FROM item_category
                        WHERE item_id = $1 AND category_id NOT IN (${
                            data.category_ids.join(", ")
                        })    
                    `,
                        [id],
                    );
                }

                const references = await this.conn.query<
                    { category_id: number }
                >(
                    `--sql
                    SELECT category_id FROM item_category
                    WHERE item_id = $1    
                `,
                    [id],
                );

                // Verifica as categorias que existem
                const n = data.category_ids.filter((e) =>
                    !(references.rows.map((e) => e.category_id).includes(e))
                );

                // Cria as as ligações
                n.forEach(async (id) => {
                    await this.conn.query(
                        `--sql
                        INSERT INTO item_category(item_id, category_id)
                        VALUES($1, $2)    
                    `,
                        [item.rows[0].id, id],
                    );
                });

                // Cria feed
                await this.conn.query(
                    `--sql
                    INSERT INTO feed(user_id, employee_id, feed_type_id, item_id, description, name)
                    VALUES ($1, $2, $3, $4, $5, $6)
                `,
                    [
                        item.rows[0].user_id,
                        employee_id,
                        2,
                        id,
                        item.rows[0].description,
                        item.rows[0].name,
                    ],
                );
            }
        } catch (err) {
            if (err instanceof DatabaseError) {
                console.error(err);

                throw new ApplicationError("Error on updating item", {
                    status: 500,
                    errorCode: "DATABASE_ERROR",
                    message: "Erro interno",
                    details: err.detail,
                });
            }

            throw err;
        }

        if (setClauses.length == 0) {
            return {};
        }

        try {
            const result = await this.conn.query<ItemSchema>(
                `--sql
                UPDATE items
                SET ${setClauses.join(", ")}
                WHERE id = $1
                RETURNING *
            `,
                values,
            );

            return result.rows[0];
        } catch (err) {
            if (err instanceof DatabaseError) {
                console.error(err);
                throw new ApplicationError("Error on updating item", {
                    status: 500,
                    errorCode: "DATABASE_ERROR",
                    message: "Erro interno",
                    details: err.detail,
                });
            }

            throw err;
        }
    }

    public async delete(id: number, employee_id?: number) {
        const result = await this.conn.query<ItemSchema>(
            `--sql
            DELETE FROM items
            WHERE id = $1
            RETURNING *
        `,
            [id],
        );

        if (result.rowCount == 0) {
            throw new ApplicationError("Item not found", {
                status: 404,
                errorCode: "NOT_FOUND",
                message: "Item não encontrado",
            });
        }

        return result.rows[0];
    }
}
