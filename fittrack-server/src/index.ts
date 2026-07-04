import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";

const app = createApp();

app.listen(Number(env.PORT), () => {
    logger.info(`Server running on port ${env.PORT}`);
    logger.info(`Environment: ${env.NODE_ENV}`);
});
