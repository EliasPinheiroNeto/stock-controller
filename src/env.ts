import 'dotenv/config';
import { z } from "zod";

const envSchema = z.object({
    API_PORT: z.string().optional(),
    DATABASE_HOST: z.string(),
    DATABASE_PORT: z.string(),
    DATABASE_USER: z.string(),
    DATABASE_PASSWORD: z.string(),
    DATABASE_NAME: z.string(),
    SECRET: z.string(),
})

type EnvSchema = z.infer<typeof envSchema>

try {
    envSchema.parse(process.env)
} catch (err) {
    console.log("Application cannot be started without correct env variables")
    process.exit(1)
}

declare global {
    namespace NodeJS {
        interface ProcessEnv extends EnvSchema { }
    }
}