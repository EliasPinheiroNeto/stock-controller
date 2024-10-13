import { Request, Response } from "express";
import CategoryService from "../services/CategoryService";
import Controller from "./Controller";
import RequestService from "../services/RequestService";
import { categoryCreateSchema, CategoryCreateSchema, categoryUpdateSchema, CategoryUpdateSchema } from "../schemas/categorySchema";

export default class CategoryController extends Controller {
    protected assignRoutes(): void {
        this.router.get('/categories', this.getAll.bind(this))
        this.router.get('/categories/:id', this.getOne.bind(this))
        this.router.get('/users/:id/categories', this.getAllFromStock.bind(this))

        this.router.post('/users/:id/categories',
            [RequestService.validateBody(categoryCreateSchema)],
            this.create.bind(this))

        this.router.patch('/categories/:id',
            [RequestService.validateBody(categoryUpdateSchema)],
            this.update.bind(this))

        this.router.delete('/categories/:id', this.delete.bind(this))
    }

    private async getAll(req: Request, res: Response) {
        const categoryService = new CategoryService(this.conn)

        const categories = await categoryService.findAll()

        res.send(categories)
        return
    }

    private async getAllFromStock(req: Request, res: Response) {
        const id = +req.params.id
        const categoryService = new CategoryService(this.conn)

        const categories = await categoryService.findAllByStockId(id)

        res.send(categories)
        return
    }

    private async getOne(req: Request, res: Response) {
        const id = +req.params.id
        const categoryService = new CategoryService(this.conn)

        try {
            const category = await categoryService.findByID(id)

            res.send(category)
            return
        } catch (err) {
            console.error(err)
            res.status(404).send()
            return
        }
    }

    private async create(req: Request, res: Response) {
        const id = +req.params.id
        const body: CategoryCreateSchema = req.body

        const categoryService = new CategoryService(this.conn)

        try {
            const data = RequestService.validateAuthHeader(req, res)

            if (data.userId != id) {
                res.status(401).send({ error: "You can't create this category" })
                return
            }

            const item = await categoryService.insert(data.userId, body)

            res.status(201).send(item)
            return
        } catch (err) {
            console.log("Error on category creation: ", err)
            res.status(400).send({ error: "Error on category creation" })
            return
        }
    }

    private async update(req: Request, res: Response) {
        const id = +req.params.id
        const body: CategoryUpdateSchema = req.body

        const categoryService = new CategoryService(this.conn)

        try {
            const category = await categoryService.findByID(id)

            const data = RequestService.validateAuthHeader(req, res)

            if (data.userId != category.user_id) {
                res.status(401).send({ error: "You can't update this category" })
                return
            }

            const newCategory = await categoryService.update(id, body)

            res.status(200).send(newCategory)
            return
        } catch (err) {
            console.log("Error on item update: ", err)
            res.status(400).send({ error: "Error on category update" })
            return
        }
    }

    private async delete(req: Request, res: Response) {
        const id = +req.params.id

        const categoryService = new CategoryService(this.conn)

        try {
            const data = RequestService.validateAuthHeader(req, res)

            const category = await categoryService.findByID(id)

            if (category.user_id != data.userId) {
                res.status(401).send({ error: "You can't delete this category" })
                throw new Error()
            }

            await categoryService.delete(id)

            res.status(200).send(category)
            return
        } catch (err) {
            console.log("Error on category delete: ", err)
            res.status(400).send({ error: "Error on delete category" })
            return
        }
    }
}