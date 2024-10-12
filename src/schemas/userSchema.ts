import { z } from "zod";

export const userSchema = z.object({
    id: z.coerce.number(),
    name: z.string(),
    email: z.string(),
    created_at: z.coerce.date()
})

export const userCreateSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string(),
}).strict()

export const userUpdateSchema = z.object({
    name: z.string().optional()
}).strict()

export const userLoginSchema = z.object({
    email: z.string(),
    password: z.string()
}).strict()

export const userToken = z.object({
    id: z.coerce.number(),
    email: z.coerce.string().email(),
})

export type UserSchema = z.infer<typeof userSchema>
export type UserCreateSchema = z.infer<typeof userCreateSchema>
export type UserUpdateSchema = z.infer<typeof userUpdateSchema>

export type UserLoginSchema = z.infer<typeof userLoginSchema>
export type UserToken = z.infer<typeof userToken>