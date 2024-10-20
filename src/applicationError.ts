type ErrorCode = "INVALID_DATA" | "INTERNAL_ERROR" | "NOT_FOUND" | "UNAUTHORIZED" | "FORBIDDEN" | "INVALID_PARAM" | "DATABASE_ERROR"

type ApplicationErrorResponse = {
    status: number
    errorCode: ErrorCode
    message: string
    details?: any
}

export default class ApplicationError extends Error {
    public response: ApplicationErrorResponse

    constructor(message: string, response: ApplicationErrorResponse) {
        super(message)
        this.response = response

        this.name = "ApplicationError"
        Object.setPrototypeOf(this, ApplicationError.prototype)
    }
}