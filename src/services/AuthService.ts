import jwt from 'jsonwebtoken'
import { AnyZodObject, z } from "zod"

import { promisify } from 'util';
import { randomBytes, pbkdf2 as pbkdf2Callback } from 'crypto'

const pbkdf2 = promisify(pbkdf2Callback);

export default class AuthService {
    // static generateToken(data: UserToken | EmployeeToken) {
    //     return jwt.sign(data, process.env.SECRET, {
    //         expiresIn: "12h"
    //     })
    // }

    // static verifyToken<T extends AnyZodObject>(token: string, schema: T) {
    //     try {
    //         const result = jwt.verify(token, process.env.SECRET)
    //         const tokenData: z.infer<typeof schema> = schema.parse(result)

    //         return tokenData
    //     } catch (err) {
    //         return undefined
    //     }
    // }

    // static decodeToken<T extends AnyZodObject>(authorizationToken: string | undefined, schema: T) {
    //     const [type, token] = authorizationToken?.split(' ') ?? [];

    //     if (!token) {
    //         return
    //     }

    //     const result = jwt.decode(token)

    //     try {
    //         const tokenData: z.infer<typeof schema> = schema.parse(result)

    //         return tokenData
    //     } catch (err) {
    //         return
    //     }
    // }

    static async hashPassword(password: string): Promise<string> {
        const salt = randomBytes(16).toString('hex');
        const derivedKey = await pbkdf2(password, salt, 1000, 32, 'sha512');
        return `${salt}:${derivedKey.toString('hex')}`;
    }

    static async verifyPassword(password: string, hash: string): Promise<boolean> {
        const [salt, originalHash] = hash.split(':');
        const derivedKey = await pbkdf2(password, salt, 1000, 32, 'sha512');
        return derivedKey.toString('hex') === originalHash
    }
}