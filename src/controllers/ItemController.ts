import { Request, Response } from "express";
import ItemService from "../services/ItemService";
import Controller from "./Controller";
import RequestService, { AuthError } from "../services/RequestService";
import { itemCreateSchema, itemUpdateSchema, ItemCreateSchema, ItemUpdateSchema } from "../schemas/itemSchema";

export default class ItemController extends Controller {
    protected assignRoutes(): void {
        this.router.get('/items', this.getAll.bind(this))
        this.router.get('/items/standalone', this.getAllWithNoCategory.bind(this))
        this.router.get('/items/:id', this.getOne.bind(this))
        this.router.get('/users/:id/items', this.getAllFromStock.bind(this))
        this.router.get('/users/:id/items/standalone', this.getAllWithNoCategoryByUser.bind(this))
        this.router.get('/categories/:id/items', this.getAllFromCategory.bind(this))

        this.router.post('/items',
            [RequestService.validateBody(itemCreateSchema)],
            this.create.bind(this))

        this.router.patch('/items/:id',
            [RequestService.validateBody(itemUpdateSchema)],
            this.update.bind(this))

        this.router.delete('/items/:id', this.delete.bind(this))
    }

    private async getAll(req: Request, res: Response) {
        const itemService = new ItemService(this.conn)

        const categories = await itemService.findAll()

        res.send(categories)
        return
    }

    private async getAllWithNoCategory(req: Request, res: Response) {
        const itemService = new ItemService(this.conn)

        const categories = await itemService.findAllWithNoCategory()

        res.send(categories)
        return
    }

    private async getAllWithNoCategoryByUser(req: Request, res: Response) {
        const id = +req.params.id
        const itemService = new ItemService(this.conn)

        const categories = await itemService.findAllWithNoCategory(id)

        res.send(categories)
        return
    }

    private async getAllFromStock(req: Request, res: Response) {
        const id = +req.params.id
        const itemService = new ItemService(this.conn)

        const categories = await itemService.findAllByUser(id)

        res.send(categories)
        return
    }

    private async getAllFromCategory(req: Request, res: Response) {
        const id = +req.params.id
        const itemService = new ItemService(this.conn)

        const categories = await itemService.findAllByCategory(id)

        res.send(categories)
        return
    }

    private async getOne(req: Request, res: Response) {
        const id = +req.params.id
        const itemService = new ItemService(this.conn)

        try {
            const category = await itemService.findByID(id)

            res.send(category)
            return
        } catch (err) {
            res.status(404).send()
            return
        }
    }



    private async create(req: Request, res: Response) {
        const body: ItemCreateSchema = req.body

        const itemService = new ItemService(this.conn)

        try {
            const data = RequestService.validateAuthHeader(req.headers.authorization)

            // see
            const item = await itemService.insert(data.userId, body, data.employeeId)

            res.status(201).send(item)
            return
        } catch (err) {
            if (err instanceof AuthError) {
                res.status(401).send({ error: err.message })
                return
            }

            console.log(err)
            res.status(400).send({ error: "Error on item creation" })
            return
        }
    }

    private async update(req: Request, res: Response) {
        const id = +req.params.id
        const body: ItemUpdateSchema = req.body

        const itemService = new ItemService(this.conn)

        try {
            const item = await itemService.findByID(id)

            const data = RequestService.validateAuthHeader(req.headers.authorization)

            if (data.userId != item.user_id) {
                res.status(401).send({ error: "You can't update this item" })
                return
            }

            const newItem = await itemService.update(id, body, data.employeeId)

            res.status(200).send(newItem)
            return
        } catch (err) {
            if (err instanceof AuthError) {
                res.status(401).send({ error: err.message })
                return
            }

            console.error(err)
            res.status(400).send({ error: "Error on item update" })
            return
        }
    }

    private async delete(req: Request, res: Response) {
        const id = +req.params.id

        const itemService = new ItemService(this.conn)

        try {
            const data = RequestService.validateAuthHeader(req.headers.authorization)

            const item = await itemService.findByID(id)

            if (item.user_id != data.userId) {
                res.status(401).send({ error: "You can't delete this item" })
                return
            }

            await itemService.delete(id, data.employeeId)

            res.status(200).send(item)
            return
        } catch (err) {
            if (err instanceof AuthError) {
                res.status(401).send({ error: err.message })
                return
            }

            console.error(err)
            res.status(400).send({ error: "Error on delete item" })
            return
        }
    }
}