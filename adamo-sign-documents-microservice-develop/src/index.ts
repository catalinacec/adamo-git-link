import express from "express";
import swaggerUi from "swagger-ui-express";
// import swaggerSpec from "./config/swagger.config";
import documentsRoutes from "./adapters/http/routes/documents.routes";
import { loadConfigDatabase } from "./infrastructure/database/mongo-connection";
import cors from "cors";
import dotenv from "dotenv";
import { auditMiddleware } from "./infrastructure/middlewares/audit.middleware";
import { errorHandler } from "./infrastructure/middlewares/error-handler.middleware";
import { responseFormatter } from "./infrastructure/middlewares/response-formatter.middleware";
import { i18nMiddleware } from "./infrastructure/middlewares/i18n.middleware";
import { documentsLimiter } from "./infrastructure/middlewares/rateLimiter.middleware";

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

// app.use("/documents/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(`/api/${apiVersion}/documents`, documentsLimiter, documentsRoutes);

if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
  app.set("trust proxy", true);
}

if (process.env.IS_LAMBDA !== "true") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

app.use(errorHandler);

export default app;
