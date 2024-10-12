import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";

export default class RequestService {
    static validateBody(schema: AnyZodObject) {
        return function (req: Request, res: Response, next: NextFunction) {
            try {
                schema.parse(req.body)

                next()
            } catch (err) {
                if (err instanceof ZodError) {
                    res.status(400).send(err.flatten())
                    return
                }
                res.status(400).send({ error: "invalid JSON" })
            }
        }
    }
}