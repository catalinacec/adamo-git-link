// Función auxiliar para verificar si el OTP ha expirado.
export function isOtpExpired(expiresAt: Date): boolean {
  return expiresAt < new Date();
}
