import { Request, Response, NextFunction } from "express";

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
interface JsonObject { [key: string]: JsonValue }
type JsonArray = JsonValue[];

function camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function deepCamelToSnake(obj: JsonValue): JsonValue {
    if (obj === null || typeof obj !== "object") return obj;
    if (Array.isArray(obj)) return obj.map(deepCamelToSnake);
    const result: JsonObject = {};
    for (const [key, value] of Object.entries(obj)) {
        result[camelToSnake(key)] = deepCamelToSnake(value as JsonValue);
    }
    return result;
}

function deepSnakeToCamel(obj: JsonValue): JsonValue {
    if (obj === null || typeof obj !== "object") return obj;
    if (Array.isArray(obj)) return obj.map(deepSnakeToCamel);
    const result: JsonObject = {};
    for (const [key, value] of Object.entries(obj)) {
        result[snakeToCamel(key)] = deepSnakeToCamel(value as JsonValue);
    }
    return result;
}

/**
 * Middleware that converts:
 * - Incoming req.body: camelCase → snake_case (for database)
 * - Outgoing res.json: snake_case → camelCase (for client)
 */
export function caseTransformMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
): void {
    // Transform incoming body from camelCase to snake_case
    if (req.body && typeof req.body === "object") {
        req.body = deepCamelToSnake(req.body);
    }

    // Override res.json to transform outgoing data from snake_case to camelCase
    const originalJson = res.json.bind(res);
    res.json = function (data: unknown) {
        if (data && typeof data === "object") {
            return originalJson(deepSnakeToCamel(data as JsonValue));
        }
        return originalJson(data);
    };

    next();
}
