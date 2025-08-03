import { WelcomeData } from "../models/dashboard-metrics.entity";

export interface IDashboardLogRepository {
  registerWelcomeActivity(userId: string, data: WelcomeData): Promise<any>;
}
