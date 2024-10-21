import z from "zod";

export const tokenSchema = z.object({
    userId: z.coerce.number(),
    employeeId: z.coerce.number().optional(),
})

export type TokenSchema = z.infer<typeof tokenSchema>