import { z } from "zod";

export const movementSchema = z.object({
    id: z.number(),
    user_id: z.number(),
    employee_id: z.number().optional(),
    item_id: z.number(),
    movement_type: z.enum(["IN", "OUT"]), // TODO: aceitar tanto string quanto number e transformar os dados
    quantity: z.number(),
    created_at: z.date()
}).strict()

export const movementCreateSchema = z.object({
    employee_id: z.number().optional(),
    items: z.array(z.object({
        item_id: z.number(),
        movement_type: z.enum(["IN", "OUT"]),
        quantity: z.number()
    }).strict()).min(1)
}).strict()

export type MovementSchema = z.infer<typeof movementSchema>
export type MovementCreateSchema = z.infer<typeof movementCreateSchema>