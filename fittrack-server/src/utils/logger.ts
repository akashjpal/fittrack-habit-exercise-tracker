const colors = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    gray: "\x1b[90m",
};

function timestamp(): string {
    return new Date().toISOString();
}

export const logger = {
    info(message: string, context?: string) {
        const ctx = context ? `${colors.blue}[${context}]${colors.reset} ` : "";
        console.log(`${colors.gray}${timestamp()}${colors.reset} ${ctx}${colors.green}INFO${colors.reset}  ${message}`);
    },
    warn(message: string, context?: string) {
        const ctx = context ? `${colors.blue}[${context}]${colors.reset} ` : "";
        console.warn(`${colors.gray}${timestamp()}${colors.reset} ${ctx}${colors.yellow}WARN${colors.reset}  ${message}`);
    },
    error(message: string, context?: string) {
        const ctx = context ? `${colors.blue}[${context}]${colors.reset} ` : "";
        console.error(`${colors.gray}${timestamp()}${colors.reset} ${ctx}${colors.red}ERROR${colors.reset} ${message}`);
    },
    debug(message: string, context?: string) {
        if (process.env.NODE_ENV === "development") {
            const ctx = context ? `${colors.blue}[${context}]${colors.reset} ` : "";
            console.debug(`${colors.gray}${timestamp()}${colors.reset} ${ctx}${colors.gray}DEBUG${colors.reset} ${message}`);
        }
    },
};
