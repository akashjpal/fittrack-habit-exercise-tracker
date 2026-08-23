import {
    deepCamelToSnake as _deepCamelToSnake,
    deepSnakeToCamel as _deepSnakeToCamel,
} from "../middleware/caseTransform.middleware";
import type { JsonValue } from "../middleware/caseTransform.middleware";

export function deepCamelToSnake(obj: unknown): JsonValue {
    return _deepCamelToSnake(obj as JsonValue);
}

export function deepSnakeToCamel(obj: unknown): JsonValue {
    return _deepSnakeToCamel(obj as JsonValue);
}
