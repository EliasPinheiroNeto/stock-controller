import jwt from 'jsonwebtoken'
import { AnyZodObject, z } from "zod"

import { promisify } from 'util';
import { randomBytes, pbkdf2 as pbkdf2Callback } from 'crypto'
import { tokenSchema, TokenSchema } from '../schemas/tokenSchema';
import ApplicationError from '../applicationError';

const pbkdf2 = promisify(pbkdf2Callback);

export default class AuthService {
    static generateToken(data: TokenSchema) {
        return jwt.sign(data, process.env.SECRET, {
            expiresIn: process.env.TOKEN_TIME ?? '12h'
        })
    }

    static validateToken(token: string) {
        try {
            const result = jwt.verify(token, process.env.SECRET)
            const tokenData = tokenSchema.parse(result)

            return tokenData
        } catch (err) {
            throw new ApplicationError("Invalid token", {
                status: 401,
                message: "Token inválido",
                errorCode: "UNAUTHORIZED"
            })
        }
    }

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