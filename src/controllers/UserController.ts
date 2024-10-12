import { Request, Response } from "express";
import UserService from "../services/UserService";
import Controller from "./Controller";
import { userCreateSchema, UserCreateSchema, userUpdateSchema, UserUpdateSchema } from "../schemas/userSchema";
import RequestService from "../services/RequestService";

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


}