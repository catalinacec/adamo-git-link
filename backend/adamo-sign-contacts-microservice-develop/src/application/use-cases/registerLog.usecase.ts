import { ValidationError } from "yup";
import { Log } from "../../domain/models/audit-log.entity";
import { ILogRepository } from "../../domain/repositories/ILogRepository";
import { getRegisterLogSchema } from "../../validators/registerLog.validator";
import { HttpError } from "../../utils/httpError";

export class RegisterLogUseCase {
  constructor(private authLogRepository: ILogRepository) {}

  async execute(
    logData: Partial<Log>,
    t: (key: string, vars?: Record<string, any>) => string
  ): Promise<Log> {
    const schema = getRegisterLogSchema(t);
    try {
      await schema.validate(logData, { abortEarly: false });
    } catch (err: any) {
      const errors =
        err instanceof ValidationError && err.errors
          ? err.errors
          : [err.message];
      throw new HttpError(
        400,
        t("validation.validation_failed"),
        undefined,
        undefined,
        errors
      );
    }

    const createdLog = await this.authLogRepository.create(logData);

    return createdLog;
  }
}
