import { Router } from "express";
import { Pool } from "pg";

export default abstract class Controller {
    public router: Router
    protected conn: Pool

    constructor(conn: Pool) {
        this.conn = conn
        this.router = Router()

        this.assignRoutes()
    }

    protected assignRoutes() { }
}