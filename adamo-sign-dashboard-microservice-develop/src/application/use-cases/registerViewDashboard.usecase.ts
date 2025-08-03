import { WelcomeData } from "../../domain/models/dashboard-metrics.entity";
import { IDashboardLogRepository } from "../../domain/repositories/IDashboardLogRepository";
import { HttpError } from "../../utils/httpError";

export class RegisterViewDashboardUseCase {
  constructor(private dashLogRepo: IDashboardLogRepository) {}

  async execute(
    user: string,
    data: WelcomeData,
    t: (key: string, vars?: Record<string, any>) => string
  ): Promise<any> {
    console.log("Registering dashboard view for user:", user);
    const dashActivity = await this.dashLogRepo.registerWelcomeActivity(
      user,
      data
    );
    console.log("Dashboard activity registered:", dashActivity);

    if (!dashActivity) {
      throw new HttpError(400, t("custom.failed_register_dashboard_activity"));
    }

    return dashActivity;
  }
}
