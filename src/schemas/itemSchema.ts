import { z } from "zod";

export const itemSchema = z.object({
    id: z.coerce.number(),
    user_id: z.number(),
    employee_id: z.number().optional(),
    name: z.string(),
    description: z.string().optional(),
    created_at: z.date(),
    updated_at: z.date(),
    stock: z.number()
})

export const itemCreateSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    employee_id: z.number().optional(),
    category_ids: z.array(z.number()).optional(),
}).strict()

export const itemUpdateSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    category_ids: z.array(z.number()).optional(),
}).strict()

export type ItemSchema = z.infer<typeof itemSchema>
export type ItemCreateSchema = z.infer<typeof itemCreateSchema>
export type ItemUpdateSchema = z.infer<typeof itemUpdateSchema>