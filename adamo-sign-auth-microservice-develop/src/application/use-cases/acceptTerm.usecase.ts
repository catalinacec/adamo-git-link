import { getAcceptTermSchema } from "../../validators/acceptTerm.validator";
import type { ITermRepository } from "../../domain/repositories/ITermRepository";
import type { IUserRepository } from "../../domain/repositories/IUserRepository";
import { HttpError } from "../../utils/httpError";

export class AcceptTermUseCase {
  constructor(
    private termRepository: ITermRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(
    termData: {
      _id: string;
      userId: string;
      status: string;
    },
    t: (key: string, vars?: Record<string, any>) => string
  ): Promise<void> {
    // 1) Validación de esquema i18n-aware
    const schema = getAcceptTermSchema(t);
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

    // 2) Validación de negocio: _id obligatorio
    if (!termData._id || typeof termData._id !== "string") {
      throw new HttpError(400, t("validation.required", { field: "_id" }));
    }

    // 3) Verificar existencia del término
    const term = await this.termRepository.findById(termData._id);
    if (!term) {
      throw new HttpError(
        404,
        t("errors.resource.not_found", { entity: "term" })
      );
    }

    // 4) Aceptar términos
    await this.userRepository.acceptTerms(
      termData.userId,
      term._id as string,
      termData.status === "accepted"
    );
  }
}
