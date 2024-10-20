import { Request, Response } from "express";
import CategoryService from "../services/CategoryService";
import Controller from "./Controller";
import RequestService from "../services/RequestService";
import { categoryCreateSchema, CategoryCreateSchema, categoryUpdateSchema, CategoryUpdateSchema } from "../schemas/categorySchema";
import ApplicationError from "../applicationError";

export default class CategoryController extends Controller {
    protected assignRoutes(): void {
        this.router.get('/categories', this.getAll.bind(this))

        this.router.get('/categories/:id',
            [RequestService.validateNumberParam('id')],
            this.getOne.bind(this))

        this.router.get('/users/:id/categories',
            [RequestService.validateNumberParam('id')],
            this.getAllFromStock.bind(this))

        this.router.post('/categories',
            [RequestService.validateBody(categoryCreateSchema)],
            this.create.bind(this))

        this.router.patch('/categories/:id',
            [RequestService.validateNumberParam('id'), RequestService.validateBody(categoryUpdateSchema)],
            this.update.bind(this))

        this.router.delete('/categories/:id',
            [RequestService.validateNumberParam('id')],
            this.delete.bind(this))
    }

    private async getAll(req: Request, res: Response) {
        const categoryService = new CategoryService(this.conn)

        try {
            const categories = await categoryService.findAll()

            res.send(categories)
        } catch (err) {
            this.errorHandler(err, res)
        }
        return
    }

    private async getAllFromStock(req: Request, res: Response) {
        const id = +req.params.id
        const categoryService = new CategoryService(this.conn)

        try {
            const categories = await categoryService.findAllByStockId(id)

            res.send(categories)
        } catch (err) {
            this.errorHandler(err, res)
        }
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
            this.errorHandler(err, res)
        }
    }

    private async create(req: Request, res: Response) {
        const body: CategoryCreateSchema = req.body
        const categoryService = new CategoryService(this.conn)

        try {
            const data = RequestService.validateAuthHeader(req.headers.authorization)

            const item = await categoryService.insert(data.userId, body, data.employeeId)

            res.status(201).send(item)
            return
        } catch (err) {
            this.errorHandler(err, res)
        }
    }

    private async update(req: Request, res: Response) {
        const id = +req.params.id
        const body: CategoryUpdateSchema = req.body
        const categoryService = new CategoryService(this.conn)

        try {
            const category = await categoryService.findByID(id)

            const data = RequestService.validateAuthHeader(req.headers.authorization)

            if (data.userId != category.user_id) {
                throw new ApplicationError("Autorization error on update category", {
                    status: 401,
                    errorCode: "UNAUTHORIZED",
                    message: "Você não tem permissão para atualizar esta categoria"
                })
            }

            const newCategory = await categoryService.update(id, body, data.employeeId)

            res.status(200).send(newCategory)
            return
        } catch (err) {
            this.errorHandler(err, res)
        }
    }

    private async delete(req: Request, res: Response) {
        const id = +req.params.id
        const categoryService = new CategoryService(this.conn)

        try {
            const data = RequestService.validateAuthHeader(req.headers.authorization)

            const category = await categoryService.findByID(id)

            if (category.user_id != data.userId) {
                throw new ApplicationError("Autorization error on delete category", {
                    status: 401,
                    errorCode: "UNAUTHORIZED",
                    message: "Você não tem permissão para deletar esta categoria"
                })
            }

            await categoryService.delete(id, data.employeeId)

            res.status(200).send(category)
            return
        } catch (err) {
            this.errorHandler(err, res)
        }
    }
}