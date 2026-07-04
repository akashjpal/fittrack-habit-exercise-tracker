export class AppError extends Error {
    constructor(
        public readonly statusCode: number,
        message: string,
        public readonly code: string = "INTERNAL_ERROR",
    ) {
        super(message);
        this.name = "AppError";
    }

    static badRequest(message: string) {
        return new AppError(400, message, "BAD_REQUEST");
    }

    static unauthorized(message: string = "Unauthorized") {
        return new AppError(401, message, "UNAUTHORIZED");
    }

    static forbidden(message: string = "Forbidden") {
        return new AppError(403, message, "FORBIDDEN");
    }

    static notFound(message: string = "Not found") {
        return new AppError(404, message, "NOT_FOUND");
    }

    static internal(message: string = "Internal server error") {
        return new AppError(500, message, "INTERNAL_ERROR");
    }
}
