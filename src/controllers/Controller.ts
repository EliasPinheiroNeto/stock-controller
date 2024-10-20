import { Router, Response } from "express";
import { Pool } from "pg";
import ApplicationError from "../applicationError";

export default abstract class Controller {
    public router: Router
    protected conn: Pool

    constructor(conn: Pool) {
        this.conn = conn
        this.router = Router()

        this.assignRoutes()
    }

    protected assignRoutes() { }

    protected errorHandler(err: unknown, res: Response) {
        if (err instanceof ApplicationError) {
            res.status(err.response.status).send(err.response)
            return
        }

        console.error(err)
        res.status(500).send({ error: "Internal error" })
        return
    }
}