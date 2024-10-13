import { Request, Response } from "express";
import UserService from "../services/UserService";
import Controller from "./Controller";
import { userCreateSchema, UserCreateSchema, userLoginSchema, UserLoginSchema, userUpdateSchema, UserUpdateSchema } from "../schemas/userSchema";
import RequestService from "../services/RequestService";
import AuthService from "../services/AuthService";

export default class UserController extends Controller {
    protected assignRoutes(): void {
        this.router.get('/users', this.getAll.bind(this))
        this.router.get('/users/:id', this.getOne.bind(this))

        this.router.post('/users',
            [RequestService.validateBody(userCreateSchema)],
            this.create.bind(this))

        this.router.patch('/users/:id',
            [RequestService.validateBody(userUpdateSchema)],
            this.update.bind(this))

        this.router.post('/users/login',
            [RequestService.validateBody(userLoginSchema)],
            this.login.bind(this))

        this.router.delete('/users/:id', this.delete.bind(this))
    }

    private async getAll(req: Request, res: Response) {
        const userService = new UserService(this.conn)

        const users = await userService.findAll()

        res.send(users)
        return
    }

    private async getOne(req: Request, res: Response) {
        const id = +req.params.id
        const userService = new UserService(this.conn)

        try {
            const user = await userService.findByID(id)

            res.send(user)
            return
        } catch (err) {
            res.status(404).send()
            return
        }
    }

    private async create(req: Request, res: Response) {
        const body: UserCreateSchema = req.body

        const userService = new UserService(this.conn)

        try {
            const user = await userService.insert(body)

            res.status(201).send(user)
            return
        } catch (err) {
            console.log("Error on user creation: ", err)
            res.status(400).send({ error: "Error on user creation" })
            return
        }
    }

    private async update(req: Request, res: Response) {
        const id = +req.params.id
        const body: UserUpdateSchema = req.body

        const userService = new UserService(this.conn)

        try {
            const user = await userService.update(id, body)

            res.status(200).send(user)
            return
        } catch (err) {
            console.log("Error on user update: ", err)
            res.status(400).send({ error: "Error on user update" })
            return
        }
    }

    private async delete(req: Request, res: Response) {
        const id = +req.params.id

        const userService = new UserService(this.conn)

        try {
            const data = RequestService.validateAuthHeader(req, res)

            if (id != data.userId) {
                res.status(401).send({ error: "You can't delete this user" })
                throw new Error()
            }

            const user = await userService.delete(id)

            res.status(200).send(user)
            return
        } catch (err) {
            console.log("Error on user delete: ", err)
            res.status(400).send({ error: "Error on delete user" })
            return
        }
    }

    private async login(req: Request, res: Response) {
        const body: UserLoginSchema = req.body

        const userService = new UserService(this.conn)

        try {
            const user = await userService.validateLogin(body)

            const token = AuthService.generateToken({
                userId: user.id,
                email: user.email
            })

            res.send({
                user,
                token
            })

            return
        } catch (err) {
            res.status(401).send({ error: "User or password invalid" })
            return
        }
    }
}