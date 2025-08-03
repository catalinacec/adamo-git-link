import { Request, Response } from "express";
import { NotificationRepository } from "../../../infrastructure/repositories/notification.repository";
import { ListNotificationsUseCase } from "../../../application/use-cases/listNotifications.usecase";
import { MarkNotificationReadUseCase } from "../../../application/use-cases/markNotificationRead.usecase";
import { DeleteNotificationUseCase } from "../../../application/use-cases/deleteNotification.usecase";
import { CreateNotificationUseCase } from "../../../application/use-cases/createNotification.usecase";
import { Pagination } from "../../../domain/models/api-response.model";
import { CountUnreadNotificationsUseCase } from "../../../application/use-cases/countUnreadNotifications.usecase";
import { HttpError } from "../../../utils/httpError";
import { getErrorMessage } from "../../../utils/setErrorMessage";
import {
  setPagination,
  setSuccessMessage,
} from "../../../utils/responseHelpers";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; uuid?: string };
    }
  }
}

const repo = new NotificationRepository();
const createNot = new CreateNotificationUseCase(repo);
const listNot = new ListNotificationsUseCase(repo);
const markNot = new MarkNotificationReadUseCase(repo);
const deleteNot = new DeleteNotificationUseCase(repo);
const countUnreadNot = new CountUnreadNotificationsUseCase(repo);

export class notificationsController {
  static async health(req: Request, res: Response) {
    return res
      .status(200)
      .json({ status: "success", message: "Microservice is healthy" });
  }

  static async create(req: Request, res: Response) {
    try {
      const t = req.t;
      const userData = { ...req.body, _id: req.user?.id ?? "" };
      const notification = await createNot.execute(userData, t);

      setSuccessMessage(req, res, "notification", "create");
      res.status(201).json(notification);
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }

      const message = getErrorMessage(req, "notification", "create");
      throw new HttpError(500, message);
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const userUUID = (req as any).user.uuid;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const { notifications, total } = await listNot.execute(
        userId,
        userUUID,
        page,
        limit
      );

      const pagination = new Pagination(
        page,
        Math.ceil(total / limit),
        limit,
        total
      );

      setSuccessMessage(req, res, "notifications", "list");
      setPagination(res, pagination);
      res.status(200).json(notifications);
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }

      const message = getErrorMessage(req, "notification", "list");
      throw new HttpError(500, message);
    }
  }

  static async markRead(req: Request, res: Response) {
    const t = req.t;
    try {
      const userData = {
        ...req.body,
        _id: req.user?.id ?? "",
        uuid: req.user?.uuid ?? "",
      };
      const { id } = req.params;
      await markNot.execute(id, userData._id, userData.uuid, t);

      setSuccessMessage(
        req,
        res,
        "notification",
        "mark",
        t("custom.notification_mark_read")
      );
      res.status(200).json(null);
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }

      const message = getErrorMessage(
        req,
        "notification",
        "mark",
        t("errors.notification.mark_as_read_failed")
      );
      throw new HttpError(500, message);
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const t = req.t;
      const userData = {
        ...req.body,
        _id: req.user?.id ?? "",
        uuid: req.user?.uuid ?? "",
      };
      const { id } = req.params;
      await deleteNot.execute(id, userData._id, userData.uuid, t);

      setSuccessMessage(req, res, "notification", "delete");
      res.status(200).json(null);
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }

      const message = getErrorMessage(req, "notification", "delete");
      throw new HttpError(500, message);
    }
  }

  static async countUnread(req: Request, res: Response) {
    const t = req.t;
    try {
      const userId = (req as any).user.id;
      const userUUID = (req as any).user.uuid;
      const unreadCount = await countUnreadNot.execute(userId, userUUID);

      setSuccessMessage(
        req,
        res,
        "notifications",
        "count",
        t("custom.unread_notifications_counted")
      );
      res.status(200).json({ unreadCount });
    } catch (err: any) {
      const message = getErrorMessage(
        req,
        "notification",
        "count",
        t("errors.notification.count_unread_failed")
      );
      throw new HttpError(500, message);
    }
  }
}
