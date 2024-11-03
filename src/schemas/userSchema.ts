import { z } from "zod";

export const userSchema = z.object({
    business_name: z.string(),
    id: z.coerce.number(),
    name: z.string(),
    email: z.string(),
    created_at: z.date(),
    updated_at: z.date()
})

export const userFullSchema = z.object({
    business_name: z.string(),
    id: z.coerce.number(),
    name: z.string(),
    email: z.string(),
    password: z.string(),
    created_at: z.date(),
    updated_at: z.date()
})

export const userCreateSchema = z.object({
    business_name: z.string(),
    name: z.string(),
    email: z.string().email(),
    password: z.string(),
}).strict()

export const userUpdateSchema = z.object({
    business_name: z.string().optional(),
    name: z.string().optional()
}).strict()

export const userLoginSchema = z.object({
    email: z.string(),
    password: z.string()
}).strict()

export type UserSchema = z.infer<typeof userSchema>
export type UserFullSchema = z.infer<typeof userFullSchema>
export type UserCreateSchema = z.infer<typeof userCreateSchema>
export type UserUpdateSchema = z.infer<typeof userUpdateSchema>

export type UserLoginSchema = z.infer<typeof userLoginSchema>