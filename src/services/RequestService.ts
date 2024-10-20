import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";
import AuthService from "./AuthService";
import ApplicationError from "../applicationError";


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
                try {
                    schema.parse(req.body)

                    next()
                } catch (err) {
                    if (err instanceof ZodError) {
                        throw new ApplicationError("Error on body validation", {
                            status: 400,
                            message: "Dados inválidos",
                            errorCode: "INVALID_DATA",
                            details: err.flatten()
                        })
                    }

                    throw err
                }
            } catch (err) {
                next(err)
            }
        }
    }

    static validateAuthHeader(reqToken?: string) {
        if (!reqToken) {
            throw new ApplicationError("Error on auth validation", {
                status: 401,
                message: "Token não informado",
                errorCode: "UNAUTHORIZED"
            })
        }

        const [type, token] = reqToken?.split(' ') ?? [];

        if (!type || type !== "Bearer") {
            throw new ApplicationError("Error on auth validation", {
                status: 401,
                message: "Token inválido",
                errorCode: "UNAUTHORIZED"
            })
        }

        if (!token) {
            throw new ApplicationError("Error on auth validation", {
                status: 401,
                message: "Token inválido",
                errorCode: "UNAUTHORIZED"
            })
        }

        return AuthService.validateToken(token)
    }

    static validateNumberParam(param: string) {
        return function (req: Request, res: Response, next: NextFunction) {
            try {
                if (!req.params[param] || isNaN(+req.params[param])) {
                    throw new ApplicationError("Error on param validation", {
                        status: 400,
                        message: "Parâmetro inválido",
                        errorCode: "INVALID_PARAM"
                    })
                }

                next()
            } catch (err) {
                next(err)
            }
        }
    }
}