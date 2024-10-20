import { movementCreateSchema, MovementCreateSchema } from "../schemas/movementSchema";
import MovementService from "../services/MovementService";
import RequestService from "../services/RequestService";
import Controller from "./Controller";
import { Request, Response } from "express";

export default class MovementController extends Controller {
    protected assignRoutes(): void {
        this.router.get('/movements', this.getAll.bind(this));
        this.router.get('/users/:id/movements', this.getAllByUser.bind(this));
        this.router.get('/items/:id/movements', this.getAllByItem.bind(this));
        this.router.post('/movements', [RequestService.validateBody(movementCreateSchema)], this.create.bind(this));
    }

    private async getAll(req: Request, res: Response) {
        const movementService = new MovementService(this.conn);
        const result = await movementService.findAll();
        res.send(result);
    }

    private async getAllByUser(req: Request, res: Response) {
        const id = +req.params.id;
        const movementService = new MovementService(this.conn);
        const result = await movementService.findAllByUser(id);
        res.send(result);
    }

    private async getAllByItem(req: Request, res: Response) {
        const id = +req.params.id;
        const movementService = new MovementService(this.conn);
        const result = await movementService.findAllByItem(id);
        res.send(result);
    }

    private async create(req: Request, res: Response) {
        const body: MovementCreateSchema = req.body;
        const movementService = new MovementService(this.conn);
        try {
            const data = RequestService.validateAuthHeader(req.headers.authorization);
            const result = await movementService.insert(data.userId, body);
            res.status(201).send(result);
        } catch (err) {
            console.error("Error on create Movement", err);
            res.status(400).send({ error: "Error on create movement" });
        }
    }
}