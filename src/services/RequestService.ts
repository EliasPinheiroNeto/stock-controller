import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";
import AuthService from "./AuthService";

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

    static validateAuthHeader(req: Request, res: Response) {
        try {
            const [type, token] = req.headers.authorization?.split(' ') ?? [];

            if (!type || type !== "Bearer") {
                res.status(401).send({ error: "Invalid token" })
                throw new Error("Invalid token")
            }

            if (!token) {
                res.status(401).send({ error: "No token provied" })
                throw new Error("Invalid token")
            }

            return AuthService.validateToken(token)
        } catch (err) {
            throw err
        }
    }
}