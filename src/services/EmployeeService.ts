import { DatabaseError, Pool } from "pg";
import AuthService from "./AuthService";
import { EmployeeCreateSchema, EmployeeFullSchema, EmployeeLoginSchema, EmployeeSchema, EmployeeUpdateSchema } from "../schemas/employeeSchema";
import ApplicationError from "../applicationError";

export default class EmployeeService {
    private conn: Pool

    constructor(conn: Pool) {
        this.conn = conn
    }

    public async findAll() {
        const result = await this.conn.query<EmployeeSchema>(`--sql
            SELECT
                id,
                name,
                user_id,
                created_at,
                updated_at,
                identity
            FROM employees
        `)

        return result.rows
    }

    public async findByID(id: number) {
        const result = await this.conn.query<EmployeeSchema>(`--sql
            SELECT
                id,
                name,
                user_id,
                created_at,
                updated_at,
                identity
            FROM employees
            WHERE id = $1
        `, [id])

        if (result.rowCount == 0) {
            throw new ApplicationError("Employee not found", {
                status: 404,
                errorCode: "NOT_FOUND",
                message: "Funcionário não encontrado"
            })
        }

        return result.rows[0]
    }

    public async findByUserId(userId: number) {
        const result = await this.conn.query<EmployeeSchema>(`--sql
            SELECT
                id,
                name,
                user_id,
                created_at,
                updated_at,
                identity
            FROM employees
            WHERE user_id = $1
        `, [userId])

        return result.rows
    }

    public async insert(userId: number, data: EmployeeCreateSchema) {
        try {
            const hashedPassword = await AuthService.hashPassword(data.password)

            const nextval = await this.conn.query<{ nextval: number }>(`--sql
                SELECT nextval('employees_id_seq') as nextval
            `)

            const identity = AuthService.generateRandomIdentity(nextval.rows[0].nextval)

            const result = await this.conn.query<EmployeeSchema>(`--sql
                INSERT INTO employees(name, user_id, password, identity)
                VALUES ($1, $2, $3, $4)
                RETURNING id, name, user_id, created_at, updated_at, identity;
            `, [data.name, userId, hashedPassword, identity])

            return result.rows[0]
        } catch (err) {
            if (err instanceof DatabaseError) {
                console.error(err)
                throw new ApplicationError("Error on inserting employee", {
                    status: 500,
                    errorCode: "DATABASE_ERROR",
                    message: "Erro interno",
                    details: err.detail
                })
            }

            throw err
        }
    }

    public async update(id: number, data: EmployeeUpdateSchema) {
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
            const query = `--sql
                UPDATE employees
                SET ${setClauses.join(', ')}
                WHERE id = $1
            RETURNING id, name, user_id, created_at, updated_at, identity
            `;

            const result = await this.conn.query<EmployeeSchema>(query, values);

            return result.rows[0]
        } catch (err) {
            if (err instanceof DatabaseError) {
                console.error(err)
                throw new ApplicationError("Error on update employee", {
                    status: 500,
                    errorCode: "DATABASE_ERROR",
                    message: "Erro interno",
                    details: err.detail
                })
            }

            throw err
        }
    }

    public async delete(id: number) {
        const result = await this.conn.query<EmployeeFullSchema>(`--sql
            DELETE FROM employees
            WHERE id = $1
            RETURNING *
        `, [id]);

        if (result.rowCount == 0) {
            throw new ApplicationError("Employee not found", {
                status: 404,
                errorCode: "NOT_FOUND",
                message: "Funcionário não encontrado"
            })
        }

        return result.rows[0]
    }

    public async validateLogin(data: EmployeeLoginSchema) {
        const result = await this.conn.query<EmployeeFullSchema>(`--sql
            SELECT e.*, u.email
            FROM employees e
            JOIN users u ON e.user_id = u.id
            WHERE identity = $1
        `, [data.identity])

        if (result.rowCount == 0) {
            throw new ApplicationError("Employee not found", {
                status: 404,
                errorCode: "NOT_FOUND",
                message: "Funcionário não encontrado"
            })
        }

        const { password, ...user } = result.rows[0]

        if (!(await AuthService.verifyPassword(data.password, password))) {
            throw new ApplicationError("Invalid password", {
                status: 401,
                errorCode: "UNAUTHORIZED",
                message: "Senha inválida"
            })
        }

        return user
    }
}