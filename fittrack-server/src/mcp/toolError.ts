import { AppError } from "../utils/errors";

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
