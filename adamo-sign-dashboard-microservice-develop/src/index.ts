import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.config";
import dashboardRoutes from "./adapters/http/routes/dashboard.routes";
import { loadConfigDatabase } from "./infrastructure/database/mongo-connection";
import rateLimit from "express-rate-limit";
import cors from "cors";
import dotenv from "dotenv";
import { auditMiddleware } from "./infrastructure/middlewares/audit.middleware";
import { errorHandler } from "./infrastructure/middlewares/error-handler.middleware";
import { responseFormatter } from "./infrastructure/middlewares/response-formatter.middleware";
import { i18nMiddleware } from "./infrastructure/middlewares/i18n.middleware";
import { dashboardLimiter } from "./infrastructure/middlewares/rateLimiter.middleware";

dotenv.config();
loadConfigDatabase();

const app = express();
const PORT = process.env.PORT || 3000;
const apiVersion = "v1";

app.use(cors());
app.use(express.json({ type: "application/json" }));
app.use(i18nMiddleware);

app.use(auditMiddleware);
app.use(responseFormatter());

app.set("trust proxy", "loopback");

app.use("/dashboard/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(`/api/${apiVersion}/dashboard`, dashboardLimiter, dashboardRoutes);

if (process.env.IS_LAMBDA !== "true") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

app.use(errorHandler);

export default app;
