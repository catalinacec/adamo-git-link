import { Log } from "../../domain/models/audit-log.entity";
import { ILogRepository } from "../../domain/repositories/ILogRepository";
import { registerLogSchema } from "../../validators/registerLog.validator";

export class RegisterLogUseCase {
  constructor(private authLogRepository: ILogRepository) {}

  async execute(logData: Partial<Log>): Promise<Log> {
    // Validate the log data using the schema
    await registerLogSchema.validate(logData);

    // Create the log entry in the repository
    const createdLog = await this.authLogRepository.create(logData);

    return createdLog;
  }
}
