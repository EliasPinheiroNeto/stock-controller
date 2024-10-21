import { z } from "zod";

export const employeeSchema = z.object({
    id: z.coerce.number(),
    identity: z.string(),
    name: z.string(),
    user_id: z.number(),
    created_at: z.date(),
    updated_at: z.date()
})

export const employeeFullSchema = z.object({
    id: z.coerce.number(),
    identity: z.string(),
    name: z.string(),
    user_id: z.number(),
    created_at: z.date(),
    updated_at: z.date(),
    password: z.string()
})

export const employeeCreateSchema = z.object({
    name: z.string(),
    password: z.string(),
}).strict()

export const employeeUpdateSchema = z.object({
    name: z.string().optional(),
    password: z.string().optional(),
}).strict()

export const employeeLoginSchema = z.object({
    identity: z.string(),
    password: z.string()
}).strict()

export type EmployeeSchema = z.infer<typeof employeeSchema>
export type EmployeeFullSchema = z.infer<typeof employeeFullSchema>
export type EmployeeCreateSchema = z.infer<typeof employeeCreateSchema>
export type EmployeeUpdateSchema = z.infer<typeof employeeUpdateSchema>

export type EmployeeLoginSchema = z.infer<typeof employeeLoginSchema>