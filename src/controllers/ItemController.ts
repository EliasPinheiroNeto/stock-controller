import { Request, Response } from "express";
import ItemService from "../services/ItemService";
import Controller from "./Controller";
import RequestService from "../services/RequestService";
import { itemCreateSchema, itemUpdateSchema, ItemCreateSchema, ItemUpdateSchema } from "../schemas/itemSchema";
import ApplicationError from "../applicationError";
import AccountingService from "../services/AccountingService";

export default class ItemController extends Controller {
    protected assignRoutes(): void {
        this.router.get('/items', this.getAll.bind(this))

        this.router.get('/items/standalone', this.getAllWithNoCategory.bind(this))

        this.router.get('/items/:id',
            [RequestService.validateNumberParam('id')],
            this.getOne.bind(this))

        this.router.get('/items/:id/mediumPrice',
            [RequestService.validateNumberParam('id')],
            this.getMediumPrice.bind(this))

        this.router.get('/users/:id/items',
            [RequestService.validateNumberParam('id')],
            this.getAllFromStock.bind(this))

        this.router.get('/users/:id/items/standalone',
            [RequestService.validateNumberParam('id')],
            this.getAllWithNoCategoryByUser.bind(this))

        this.router.get('/categories/:id/items',
            [RequestService.validateNumberParam('id')],
            this.getAllFromCategory.bind(this))

        this.router.post('/items',
            [RequestService.validateBody(itemCreateSchema)],
            this.create.bind(this))

        this.router.patch('/items/:id',
            [RequestService.validateNumberParam('id'), RequestService.validateBody(itemUpdateSchema)],
            this.update.bind(this))

        this.router.delete('/items/:id',
            [RequestService.validateNumberParam('id')],
            this.delete.bind(this))
    }

    private async getAll(req: Request, res: Response) {
        const itemService = new ItemService(this.conn)

        try {
            const categories = await itemService.findAll()

            res.send(categories)
            return
        } catch (err) {
            this.errorHandler(err, res)
        }
    }

    private async getAllWithNoCategory(req: Request, res: Response) {
        const itemService = new ItemService(this.conn)

        try {
            const categories = await itemService.findAllWithNoCategory()

            res.send(categories)
            return
        } catch (err) {
            this.errorHandler(err, res)
        }
    }

    private async getAllWithNoCategoryByUser(req: Request, res: Response) {
        const id = +req.params.id
        const itemService = new ItemService(this.conn)

        try {
            const categories = await itemService.findAllWithNoCategory(id)

            res.send(categories)
            return
        } catch (err) {
            this.errorHandler(err, res)
        }
    }

    private async getAllFromStock(req: Request, res: Response) {
        const id = +req.params.id
        const itemService = new ItemService(this.conn)


        try {
            const categories = await itemService.findAllByUser(id)

            res.send(categories)
            return
        } catch (err) {
            this.errorHandler(err, res)
        }
    }

    private async getAllFromCategory(req: Request, res: Response) {
        const id = +req.params.id
        const itemService = new ItemService(this.conn)

        try {
            const categories = await itemService.findAllByCategory(id)

            res.send(categories)
        } catch (err) {
            this.errorHandler(err, res)
        }
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
            this.errorHandler(err, res)
        }
    }



    private async create(req: Request, res: Response) {
        const body: ItemCreateSchema = req.body
        const itemService = new ItemService(this.conn)

        try {
            const data = RequestService.validateAuthHeader(req.headers.authorization)

            const item = await itemService.insert(data.userId, body, data.employeeId)

            res.status(201).send(item)
            return
        } catch (err) {
            this.errorHandler(err, res)
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
                throw new ApplicationError("Autorization error on update item", {
                    status: 401,
                    errorCode: 'UNAUTHORIZED',
                    message: "Você não tem permissão para atualizar este item",
                })
            }

            const newItem = await itemService.update(id, body, data.employeeId)

            res.status(200).send(newItem)
            return
        } catch (err) {
            this.errorHandler(err, res)
        }
    }

    private async delete(req: Request, res: Response) {
        const id = +req.params.id

        const itemService = new ItemService(this.conn)

        try {
            const data = RequestService.validateAuthHeader(req.headers.authorization)

            const item = await itemService.findByID(id)

            if (data.userId != item.user_id) {
                throw new ApplicationError("Autorization error on delete item", {
                    status: 401,
                    errorCode: 'UNAUTHORIZED',
                    message: "Você não tem permissão para deletar este item",
                })
            }

            await itemService.delete(id, data.employeeId)

            res.status(200).send(item)
            return
        } catch (err) {
            this.errorHandler(err, res)
        }
    }

    private async getMediumPrice(req: Request, res: Response) {
        const id = +req.params.id
        const accountingService = new AccountingService(this.conn)

        try {
            const result = await accountingService.getMediumPrice(id)

            res.send(result)
            return
        } catch (err) {
            this.errorHandler(err, res)
        }
    }
}