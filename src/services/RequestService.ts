import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";
import AuthService from "./AuthService";


export class AuthError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "AuthError"
    }
}


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

    static validateAuthHeader(reqToken?: string) {
        try {
            if (!reqToken) {
                throw new AuthError("No token providem")
            }

            const [type, token] = reqToken?.split(' ') ?? [];

            if (!type || type !== "Bearer") {
                throw new AuthError("Invalid token")
            }

            if (!token) {
                throw new AuthError("Invalid token")
            }

            return AuthService.validateToken(token)
        } catch (err) {
            throw err
        }
    }
}