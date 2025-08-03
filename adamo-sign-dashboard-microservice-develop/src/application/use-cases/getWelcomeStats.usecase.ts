import { WelcomeData } from "../../domain/models/dashboard-metrics.entity";
import { IDocumentsRepository } from "../../domain/repositories/IDocumentRepository";
import { INotificationRepository } from "../../domain/repositories/INotificationRepository";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { HttpError } from "../../utils/httpError";

export class GetWelcomeStatsUseCase {
  constructor(
    private userRepo: IUserRepository,
    private notificationsRepo: INotificationRepository,
    private documentsRepo: IDocumentsRepository
  ) {}

  async execute(
    user: string,
    t: (key: string, vars?: Record<string, any>) => string
  ): Promise<WelcomeData> {
    console.log("Executing GetWelcomeStatsUseCase for user:", user);
    const owner = await this.userRepo.findByUUID(user);
    console.log("Owner found:", owner);

    console.log("Fetching stats for user:", user);
    const stats = await this.documentsRepo.getStats(user);

    console.log("Stats fetched:", stats);
    const totalPendingSignature = await this.documentsRepo.getPendingSignature(
      owner?.email ?? ""
    );
    console.log("Total pending signature:", totalPendingSignature);

    const profile = await this.userRepo.getProfile(user);
    console.log("User profile:", profile);

    const notifications = await this.notificationsRepo.countUnreadByUser(user);
    console.log("Unread notifications count:", notifications);

    if (!profile) {
      throw new HttpError(400, t("errors.auth.user_not_found"));
    }

    const totalDocuments =
      stats.in_progress +
      stats.rejected +
      stats.completed +
      stats.draft +
      stats.recycler;

    console.log("Total documents:", totalDocuments);

    return {
      welcomeMessage: `Welcome, ${profile.name?.split(" ")[0]} ${
        profile.surname?.split(" ")[0]
      }!`,
      plan: profile.plan || "Starter",
      documents: { ...stats, pending: totalPendingSignature },
      totalDocuments: totalDocuments,
      notifications: {
        unread: notifications,
      },
    } as WelcomeData;
  }
}
