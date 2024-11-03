import { Request, Response } from "express";
import UserService from "../services/UserService";
import Controller from "./Controller";
import { userCreateSchema, UserCreateSchema, userLoginSchema, UserLoginSchema, userUpdateSchema, UserUpdateSchema } from "../schemas/userSchema";
import RequestService from "../services/RequestService";
import AuthService from "../services/AuthService";
import ApplicationError from "../applicationError";

export default class UserController extends Controller {
    protected assignRoutes(): void {
        this.router.get('/users', this.getAll.bind(this))

        this.router.get('/users/:id',
            [RequestService.validateNumberParam('id')],
            this.getOne.bind(this))

        this.router.post('/users',
            [RequestService.validateBody(userCreateSchema)],
            this.create.bind(this))

        this.router.patch('/users/:id',
            [RequestService.validateNumberParam('id'), RequestService.validateBody(userUpdateSchema)],
            this.update.bind(this))

        this.router.post('/users/login',
            [RequestService.validateBody(userLoginSchema)],
            this.login.bind(this))

        this.router.delete('/users/:id',
            [RequestService.validateNumberParam('id')],
            this.delete.bind(this))
    }

    // TODO implementar query params
    private async getAll(req: Request, res: Response) {
        const userService = new UserService(this.conn)

        try {
            const users = await userService.findAll()

            res.send(users)
            return
        } catch (err) {
            this.errorHandler(err, res)
        }
    }

    private async getOne(req: Request, res: Response) {
        const id = +req.params.id
        const userService = new UserService(this.conn)

        try {
            const user = await userService.findByID(id)

            res.send(user)
            return
        } catch (err) {
            this.errorHandler(err, res)
        }
    }

    private async create(req: Request, res: Response) {
        const body: UserCreateSchema = req.body
        const userService = new UserService(this.conn)

        try {
            const user = await userService.insert(body)

            const token = AuthService.generateToken({
                userId: user.id,
            })

            res.status(201).send({
                user, token
            })
            return
        } catch (err) {
            this.errorHandler(err, res)
        }
    }

    private async update(req: Request, res: Response) {
        const id = +req.params.id
        const body: UserUpdateSchema = req.body
        const userService = new UserService(this.conn)

        try {
            const data = RequestService.validateAuthHeader(req.headers.authorization)

            if (id != data.userId || data.employeeId) {
                throw new ApplicationError("Autorization error on update user", {
                    status: 401,
                    message: "Você não tem permissão para atualizar este usuário",
                    errorCode: "UNAUTHORIZED",
                })
            }

            const user = await userService.update(id, body)

            res.status(200).send(user)
            return
        } catch (err) {
            this.errorHandler(err, res)
        }
    }

    private async delete(req: Request, res: Response) {
        const id = +req.params.id
        const userService = new UserService(this.conn)

        try {
            const data = RequestService.validateAuthHeader(req.headers.authorization)

            if (id != data.userId || data.employeeId) {
                throw new ApplicationError("Autorization error on delete user", {
                    status: 401,
                    message: "Você não tem permissão para deletar este usuário",
                    errorCode: "UNAUTHORIZED",
                })
            }

            const user = await userService.delete(id)

            res.status(200).send(user)
            return
        } catch (err) {
            this.errorHandler(err, res)
        }
    }

    private async login(req: Request, res: Response) {
        const body: UserLoginSchema = req.body
        const userService = new UserService(this.conn)

        try {
            const user = await userService.validateLogin(body)

            const token = AuthService.generateToken({
                userId: user.id,
            })

            res.send({
                user,
                token
            })

            return
        } catch (err) {
            this.errorHandler(err, res)
        }
    }
}