import { z } from "zod";

export const feedSchema = z.object({
    id: z.number(),
    created_at: z.date(),
    user_id: z.number(),
    feed_type_id: z.number(),

    employee_id: z.number().optional(),
    item_id: z.number().optional(),
    category_id: z.number().optional(),
    movement_id: z.number().optional(),
    description: z.string().optional(),
    name: z.string().optional(),
})

export type FeedSchema = z.infer<typeof feedSchema>