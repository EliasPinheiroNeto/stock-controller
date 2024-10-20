import { DatabaseError, Pool } from "pg";
import { UserCreateSchema, UserFullSchema, UserLoginSchema, UserSchema, UserUpdateSchema } from "../schemas/userSchema";
import AuthService from "./AuthService";
import ApplicationError from "../applicationError";
import DatabaseService from "./DatabaseService";

export default class UserService extends DatabaseService {
    public async findAll() {
        const result = await this.conn.query<UserSchema>(`--sql
            SELECT id, name, email, created_at, updated_at
            FROM users
        `)

        return result.rows
    }

    public async findByID(id: number) {
        const result = await this.conn.query<UserSchema>(`--sql
            SELECT id, name, email, created_at, updated_at
            FROM users
            WHERE id = $1
        `, [id])

        if (result.rowCount == 0) {
            throw new ApplicationError("Error on finding user", {
                status: 404,
                errorCode: "NOT_FOUND",
                message: "Usuário não encontrado"
            })
        }

        return result.rows[0]
    }

    public async insert(data: UserCreateSchema) {
        const hashedPassword = await AuthService.hashPassword(data.password)

        try {
            const result = await this.conn.query<UserSchema>(`--sql
                INSERT INTO users(name, email, password)
                VALUES ($1, $2, $3)
                RETURNING id, name, email, created_at, updated_at
            `, [data.name, data.email, hashedPassword])

            return result.rows[0]
        } catch (err) {
            if (err instanceof DatabaseError) {
                console.error(err)

                throw new ApplicationError("Error on inserting user", {
                    status: 500,
                    errorCode: "DATABASE_ERROR",
                    message: "Erro interno"
                })
            }

            throw err
        }
    }

    public async update(id: number, data: UserUpdateSchema) {
        const setClauses: string[] = [];
        const values: any[] = [id];

        if (data.name) {
            setClauses.push(`name = $${values.length + 1}`);
            values.push(data.name);
        }

        if (setClauses.length === 0) {
            return {}
        }

        try {
            const result = await this.conn.query<UserSchema>(`--sql
                UPDATE users
                SET ${setClauses.join(', ')}
                WHERE id = $1
                RETURNING id, name, email, created_at, updated_at;
            `, values);

            return result.rows[0]
        } catch (err) {
            if (err instanceof DatabaseError) {
                console.error(err)

                throw new ApplicationError("Error on updating user", {
                    status: 500,
                    errorCode: "DATABASE_ERROR",
                    message: "Erro interno"
                })
            }

            throw err
        }

    }

    public async delete(id: number) {
        const result = await this.conn.query<UserFullSchema>(`--sql
            DELETE FROM users
            WHERE id = $1
            RETURNING *
        `, [id]);

        if (result.rowCount == 0) {
            throw new ApplicationError("Error on deleting user", {
                status: 404,
                errorCode: "NOT_FOUND",
                message: "Usuário não encontrado"
            })
        }

        return result.rows[0]
    }

    public async validateLogin(data: UserLoginSchema) {
        try {
            const result = await this.conn.query<UserFullSchema>(`--sql
                SELECT *
                FROM users
                WHERE email = $1
            `, [data.email])

            if (result.rowCount == 0) {
                throw new ApplicationError("Error on validating login", {
                    status: 404,
                    errorCode: "NOT_FOUND",
                    message: "Usuário não encontrado"
                })
            }

            const { password, ...user } = result.rows[0]

            if (!(await AuthService.verifyPassword(data.password, password))) {
                throw new Error()
            }

            return user
        } catch (err) {
            if (err instanceof DatabaseError) {
                console.error(err)

                throw new ApplicationError("Error on validating login", {
                    status: 500,
                    errorCode: "DATABASE_ERROR",
                    message: "Erro interno"
                })
            }

            throw err
        }
    }
}