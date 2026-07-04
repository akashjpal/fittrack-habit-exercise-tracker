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

interface ToolErrorResult {
    content: { type: "text"; text: string }[];
    isError: true;
}

export function toToolError(err: unknown): ToolErrorResult {
    if (err instanceof AppError) {
        return {
            content: [{ type: "text", text: `[${err.code}] ${err.message}` }],
            isError: true,
        };
    }
    const message = err instanceof Error ? err.message : String(err);
    return {
        content: [{ type: "text", text: message }],
        isError: true,
    };
}
