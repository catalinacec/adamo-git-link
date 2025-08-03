import { Log } from "../../domain/models/audit-log.entity";
import { ILogRepository } from "../../domain/repositories/ILogRepository";
import { HttpError } from "../../utils/httpError";
import { getRegisterLogSchema } from "../../validators/registerLog.validator";

export class RegisterLogUseCase {
  constructor(private authLogRepository: ILogRepository) {}

  async execute(
    logData: Partial<Log>,
    t: (t: string, vars?: Record<string, any>) => string
  ): Promise<Log> {
    // Validate the log data using the schema
    const schema = getRegisterLogSchema(t);

    try {
      await schema.validate(logData, { abortEarly: false });
    } catch (err: any) {
      throw new HttpError(
        400,
        t("validation.validation_failed"),
        undefined,
        undefined,
        err.errors
      );
    }

    // Create the log entry in the repository
    const createdLog = await this.authLogRepository.create(logData);

    return createdLog;
  }
}
