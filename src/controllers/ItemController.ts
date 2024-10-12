import { Request, Response } from "express";
import Controller from "./Controller";

export default class ItemController extends Controller {
    protected assignRoutes(): void {
        this.router.get('/items', this.getItens)
    }

    private async getItens(req: Request, res: Response) {
        res.send({ status: "OK" })
    }
}