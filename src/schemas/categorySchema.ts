import { z } from "zod";

export const categorySchema = z.object({
    id: z.coerce.number(),
    user_id: z.number(),
    employee_id: z.number().optional(),
    name: z.string(),
    description: z.string().optional(),
    created_at: z.date(),
    updated_at: z.date()
})

export const categoryCreateSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    employee_id: z.number().optional()
}).strict()

export const categoryUpdateSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional()
}).strict()

export type CategorySchema = z.infer<typeof categorySchema>
export type CategoryCreateSchema = z.infer<typeof categoryCreateSchema>
export type CategoryUpdateSchema = z.infer<typeof categoryUpdateSchema>