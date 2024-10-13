import { Request, Response } from "express";
import ItemService from "../services/ItemService";
import Controller from "./Controller";
import RequestService from "../services/RequestService";
import { itemCreateSchema, itemUpdateSchema, ItemCreateSchema, ItemUpdateSchema } from "../schemas/itemSchema";

export default class ItemController extends Controller {
    protected assignRoutes(): void {
        this.router.get('/items', this.getAll.bind(this))
        this.router.get('/items/:id', this.getOne.bind(this))
        this.router.get('/users/:id/items', this.getAllFromStock.bind(this))

        this.router.post('/users/:id/items',
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

    private async getAllFromStock(req: Request, res: Response) {
        const id = +req.params.id
        const itemService = new ItemService(this.conn)

        const categories = await itemService.findAllByStockId(id)

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
        const id = +req.params.id
        const body: ItemCreateSchema = req.body

        const itemService = new ItemService(this.conn)

        try {
            const data = RequestService.validateAuthHeader(req, res)

            if (data.userId != id) {
                res.status(401).send({ error: "You can't create this item" })
                return
            }

            const item = await itemService.insert(data.userId, body)

            res.status(201).send(item)
            return
        } catch (err) {
            console.log("Error on item creation: ", err)
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

            const data = RequestService.validateAuthHeader(req, res)

            if (data.userId != item.user_id) {
                res.status(401).send({ error: "You can't update this item" })
                return
            }

            const newItem = await itemService.update(id, body)

            res.status(200).send(newItem)
            return
        } catch (err) {
            console.log("Error on item update: ", err)
            res.status(400).send({ error: "Error on item update" })
            return
        }
    }

    private async delete(req: Request, res: Response) {
        const id = +req.params.id

        const itemService = new ItemService(this.conn)

        try {
            const data = RequestService.validateAuthHeader(req, res)

            const item = await itemService.findByID(id)

            if (item.user_id != data.userId) {
                res.status(401).send({ error: "You can't delete this item" })
                throw new Error()
            }

            await itemService.delete(id)

            res.status(200).send(item)
            return
        } catch (err) {
            console.log("Error on item delete: ", err)
            res.status(400).send({ error: "Error on delete item" })
            return
        }
    }
}