import { ValidationError } from "yup";

export function formatYupSignaturesErrors(
  innerErrors: ValidationError[],
  t: (key: string, vars?: Record<string, any>) => string
): string[] {
  return innerErrors.map((err) => {
    const path = err.path || "";
    // matchea cosas como "signatures[0].signatureFile"
    const m = path.match(/^signatures\[(\d+)\]\.(\w+)$/);
    if (m) {
      const idx = parseInt(m[1], 10) + 1; // +1 para que empiece en 1
      const field = m[2]; // ej. "signatureFile"
      // puedes usar t() si tienes una key como "errors.document.signature_missing"
      // y definiste en tu i18n: "El campo '{{field}}' falta en la firma #{{index}}"
      // return t("errors.document.signature_missing", { field, index: idx });

      // o bien, si prefieres un string plano:
      return `Signature #${idx}: ${err.message}`;
    }

    // fallback para errores fuera de `signatures[...]`
    return err.message;
  });
}
