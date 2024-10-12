import express, { Express } from 'express'
import Controller from './controllers/Controller'
import cors from 'cors'
import { Pool } from 'pg'
import Service from './services/Service';

interface ControllerConstructor {
    new(conn: Pool): Controller;
}
export default class App {
    private express: Express
    private controllers: ControllerConstructor[]
    private conn

    constructor(...controllers: ControllerConstructor[]) {
        this.express = express()
        this.controllers = controllers

        this.conn = new Pool({
            host: process.env.DATABASE_HOST,
            port: Number(process.env.DATABASE_PORT),
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
        })

        this.initializeMiddlewares()
    }

    private initializeMiddlewares() {
        this.express.use(express.json())
        this.express.use(cors())
    }

    private async initializeDatabase() {
        try {
            await this.conn.connect()
            console.log("Database connected successfully");
        } catch (err) {
            console.log("Database connection error")
            throw err
        }
    }

    private initializeControllers(): void {
        try {
            this.controllers.forEach((ControllerClass) => {
                const controllerInstance = new ControllerClass(this.conn);
                this.express.use('/', controllerInstance.router)
            });
        } catch (err) {
            console.error('Error while initializing controllers', err);
            throw err;
        }
    }

    public async init() {
        const port = Number(process.env.API_PORT) ?? 3000

        try {
            await this.initializeDatabase()

            this.initializeControllers()

            this.express.listen(port, () => {
                console.log(`Application running at port: ${port}`)
            })
        } catch (err) {
            console.error(err)
            process.exit(1)
        }
    }
}