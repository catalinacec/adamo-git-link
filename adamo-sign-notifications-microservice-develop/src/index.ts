import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.config";
import notificationsRoutes from "./adapters/http/routes/notifications.routes";
import { loadConfigDatabase } from "./infrastructure/database/mongo-connection";
import cors from "cors";
import dotenv from "dotenv";
import { auditMiddleware } from "./infrastructure/middlewares/audit.middleware";
import { errorHandler } from "./infrastructure/middlewares/error-handler.middleware";
import { createServer } from "http";
import WebSocket, { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { Notification } from "./domain/models/notification.entity";
import { i18nMiddleware } from "./infrastructure/middlewares/i18n.middleware";
import { responseFormatter } from "./infrastructure/middlewares/response-formatter.middleware";
import { notificationsLimiter } from "./infrastructure/middlewares/rateLimiter.middleware";

dotenv.config();
loadConfigDatabase();

const app = express();
const PORT = parseInt(process.env.PORT || "3800", 10);
const apiVersion = "v1";

app.use(cors());
app.use(express.json({ type: "application/json" }));
app.use(i18nMiddleware);

app.use(auditMiddleware);
app.use(responseFormatter());

app.set("trust proxy", "loopback");

app.use(
  "/notifications/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);
app.use(
  `/api/${apiVersion}/notifications`,
  notificationsLimiter,
  notificationsRoutes
);
app.use(errorHandler);

// SOCKETS
const server = createServer(app);
const wss = new WebSocketServer({ server });
const clients = new Map<string, WebSocket>();

wss.on("connection", (ws, req) => {
  const params = new URLSearchParams(req.url?.split("?")[1]);
  const token = params.get("token");

  if (!token) {
    ws.close();
    return;
  }

  try {
    const JWT_PUBLIC_KEY = process.env.JWT_PUBLIC_KEY!.replace(/\\n/g, "\n");
    const decoded = jwt.verify(token, JWT_PUBLIC_KEY, {
      algorithms: ["RS256"],
    });
    if (typeof decoded === "object" && decoded !== null && "id" in decoded) {
      const userId = (decoded as jwt.JwtPayload).id as string;
      console.log(`User connected: ${userId}`);
      clients.set(userId, ws);

      ws.on("close", () => {
        console.log(`User disconnected: ${userId}`);
        clients.delete(userId);
      });
    }
  } catch (err: any) {
    console.error("Token inválido:", err.message);
    ws.close();
  }
});

export const sendNotification = (
  userId: string,
  message: { message: string; data: Notification }
) => {
  const client = clients.get(userId);

  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify({ message }));
    console.log(`💬 Mensaje enviado al usuario ${userId}: ${message}`);
  } else {
    console.log(`⚠️ Usuario ${userId} no está conectado`);
  }
};

console.log(`🚀 HTTP Server and WebSocket listening on http://0.0.0.0:${PORT}`);
server.listen(PORT);

export { app, server };
