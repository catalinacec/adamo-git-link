import { ValidationError } from "yup";

export function formatYupParticipantErrors(
  innerErrors: ValidationError[],
  t: (key: string, vars?: Record<string, any>) => string
): string[] {
  return innerErrors.map((err) => {
    const path = err.path || "";

    const participantMatch = path.match(/^participants\[(\d+)]/);
    const signatureMatch = path.match(
      /^participants\[(\d+)]\.signatures\[(\d+)]/
    );

    const participantIndex = participantMatch
      ? parseInt(participantMatch[1], 10) + 1
      : null;
    const signatureIndex = signatureMatch
      ? parseInt(signatureMatch[2], 10) + 1
      : null;
    const fieldParts = path.split(".");
    const field = fieldParts[fieldParts.length - 1];

    if (participantIndex !== null && signatureIndex !== null) {
      return t("errors.participant.signature_missing_field", {
        field,
        participant: participantIndex,
        signature: signatureIndex,
      });
    }

    if (participantIndex !== null) {
      return t("errors.participant.missing_field", {
        field,
        index: participantIndex,
      });
    }

    // Fallback
    return err.message;
  });
}
