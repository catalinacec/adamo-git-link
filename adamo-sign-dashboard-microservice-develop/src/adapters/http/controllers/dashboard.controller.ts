import { Request, Response } from "express";
import { ApiResponse } from "../../../domain/models/api-response.model";
import { GetWelcomeStatsUseCase } from "../../../application/use-cases/getWelcomeStats.usecase";
import { UserRepository } from "../../../infrastructure/repositories/user.repository";
import { NotificationRepository } from "../../../infrastructure/repositories/notification.repository";
import { DashboardLogRepository } from "../../../infrastructure/repositories/dashboard-log.repository";
import { RegisterViewDashboardUseCase } from "../../../application/use-cases/registerViewDashboard.usecase";
import { DocumentsRepository } from "../../../infrastructure/repositories/documents.repository";
import { setSuccessMessage } from "../../../utils/responseHelpers";
import { HttpError } from "../../../utils/httpError";
import { getErrorMessage } from "../../../utils/setErrorMessage";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; uuid: string };
    }
  }
}

const dashLogRepo = new DashboardLogRepository();
const userRepo = new UserRepository();
const notificationsRepo = new NotificationRepository();
const documentsRepo = new DocumentsRepository();
const welcomeUseCase = new GetWelcomeStatsUseCase(
  userRepo,
  notificationsRepo,
  documentsRepo
);
const dashboardLogUseCase = new RegisterViewDashboardUseCase(dashLogRepo);

export class DashboardController {
  static async getWelcomeStats(req: Request, res: Response) {
    try {
      const t = req.t;
      const userData = {
        ...req.body,
        _id: req.user?.id ?? "",
        uuid: req.user?.uuid ?? "",
      };
      console.log("User Data:", userData);
      const data = await welcomeUseCase.execute(userData.uuid, t);

      await dashboardLogUseCase.execute(userData.uuid, data, t);

      console.log(
        "\x1b[1m\x1b[44m\x1b[37m%s\x1b[0m",
        "✅ Flujo de dashboard completado correctamente 🚀"
      );

      setSuccessMessage(req, res, "dashboard", "retrieve");
      return res.json(data);
    } catch (error: any) {
      if (error instanceof HttpError) {
        throw error;
      }

      const message = getErrorMessage(req, "dashboard", "retrieve");
      throw new HttpError(500, message);
    }
  }

  static async health(req: Request, res: Response) {
    return res
      .status(200)
      .json({ status: "success", message: "Microservice is healthy" });
  }
}
