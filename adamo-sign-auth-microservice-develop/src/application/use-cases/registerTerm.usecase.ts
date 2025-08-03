import { Log } from "../../domain/models/audit-log.entity";
import { Term } from "../../domain/models/term.entity";
import { ITermRepository } from "../../domain/repositories/ITermRepository";
import { HttpError } from "../../utils/httpError";
import { getRegisterLogSchema } from "../../validators/registerLog.validator";

export class RegisterLogUseCase {
  constructor(private termRepository: ITermRepository) {}

  async execute(
    termData: Partial<Term>,
    t: (key: string, vars?: Record<string, any>) => string
  ): Promise<Term> {
    const schema = getRegisterLogSchema(t);

    try {
      await schema.validate(termData, { abortEarly: false });
    } catch (err: any) {
      throw new HttpError(
        400,
        t("validation.validation_failed"),
        undefined,
        undefined,
        err.errors
      );
    }

    const createTerm = await this.termRepository.create(termData);

    return createTerm;
  }
}
