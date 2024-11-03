import { DatabaseError, Pool } from "pg";
import { CategoryCreateSchema, CategorySchema, CategoryUpdateSchema } from "../schemas/categorySchema";
import ApplicationError from "../applicationError";

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
            throw new ApplicationError("Category not found", {
                status: 404,
                errorCode: "NOT_FOUND",
                message: "Categoria não encontrada"
            })
        }

        return result.rows[0]
    }

    public async insert(user_id: number, data: CategoryCreateSchema, employee_id?: number) {
        try {
            const result = await this.conn.query<CategorySchema>(`--sql
                INSERT INTO categories(user_id, name, description, employee_id)
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `, [user_id, data.name, data.description, data.employee_id])

            // Cria feed
            await this.conn.query(`--sql
                INSERT INTO feed(user_id, employee_id, feed_type_id, category_id, description, name)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [user_id, employee_id, 1, result.rows[0].id, result.rows[0].description, result.rows[0].name])

            return result.rows[0]
        } catch (err) {
            if (err instanceof DatabaseError) {
                console.error(err)

                throw new ApplicationError("Error on inserting category", {
                    status: 500,
                    errorCode: "DATABASE_ERROR",
                    message: "Erro interno"
                })
            }

            throw err
        }
    }

    public async update(id: number, data: CategoryUpdateSchema, employee_id?: number) {
        // Verifica se a categoria existe
        const category = await this.conn.query<CategorySchema>(`--sql
            SELECT *
            FROM categories
            WHERE id = $1
        `, [id])

        if (category.rowCount == 0) {
            throw new ApplicationError("Category not found", {
                status: 404,
                errorCode: "NOT_FOUND",
                message: "Categoria não encontrada"
            })
        }

        const setClauses: string[] = [];
        const values: any[] = [id];

        if (data.name) {
            setClauses.push(`name = $${values.length + 1}`);
            values.push(data.name);
        }

        if (data.description) {
            setClauses.push(`description = $${values.length + 1}`);
            values.push(data.description);
        }

        if (setClauses.length == 0) {
            return {}
        }

        try {
            const result = await this.conn.query<CategorySchema>(`--sql
                UPDATE categories
                SET ${setClauses.join(', ')}
                WHERE id = $1
                RETURNING *;
            `, values);

            // Cria feed
            await this.conn.query(`--sql
                INSERT INTO feed(user_id, employee_id, feed_type_id, category_id, description, name)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [result.rows[0].user_id, employee_id, 2, result.rows[0].id, result.rows[0].description, result.rows[0].name])

            return result.rows[0]
        } catch (err) {
            if (err instanceof DatabaseError) {
                console.error(err)
                throw new ApplicationError("Error on updating category", {
                    status: 500,
                    errorCode: "DATABASE_ERROR",
                    message: "Erro interno"
                })
            }

            throw err
        }
    }

    public async delete(id: number, employee_id?: number) {
        const result = await this.conn.query<CategorySchema>(`--sql
            DELETE FROM categories
            WHERE id = $1
            RETURNING *
        `, [id]);

        if (result.rowCount == 0) {
            throw new ApplicationError("Error on deleting category", {
                status: 401,
                errorCode: "NOT_FOUND",
                message: "Categoria não encontrada"
            })
        }

        try {
            // Cria feed
            await this.conn.query(`--sql
                INSERT INTO feed(user_id, employee_id, feed_type_id, message)
                VALUES ($1, $2, $3, $4)
            `, [result.rows[0].user_id, employee_id, 3,
            `Deleteou a categoria ${result.rows[0].name}`
            ])

            return result.rows[0]
        } catch (err) {
            if (err instanceof DatabaseError) {
                console.error(err)
                throw new ApplicationError("Error on deleting category", {
                    status: 500,
                    errorCode: "DATABASE_ERROR",
                    message: "Erro interno"
                })
            }

            throw err
        }
    }
}