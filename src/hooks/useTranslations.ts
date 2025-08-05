// Temporary useTranslations hook for i18n
export function useTranslations(namespace: string) {
  // This is a simple mock implementation
  // In the real app, this would connect to the actual i18n system
  
  const translations: Record<string, Record<string, string>> = {
    auth: {
      signinSubtitle: "Inicia sesión en tu cuenta",
      emailRequired: "Email es requerido",
      emailInvalid: "Email inválido",
      emailPlaceholder: "Correo electrónico",
      passwordPlaceholder: "Contraseña",
      passwordMinLength: "La contraseña debe tener al menos 6 caracteres",
      newPassword: "Nueva contraseña",
      confirmPassword: "Confirmar contraseña",
      confirmPasswordRequired: "Confirmar contraseña es requerido",
      passwordsMustMatch: "Las contraseñas deben coincidir",
      updatePassword: "Actualizar Contraseña",
      updatePasswordDescription: "Por favor, establece una nueva contraseña para continuar",
      forgotPassword: "¿Olvidaste tu contraseña? Haz click aquí",
      continue: "Continuar",
      signin: "Iniciar sesión",
      loading: "Cargando...",
      updating: "Actualizando...",
      serverError: "Error del servidor",
      invalidCredentials: "Credenciales inválidas",
      tooManyAttempts: "Demasiados intentos",
      internalServerError: "Error interno del servidor",
      passwordUpdateSuccess: "Contraseña actualizada exitosamente",
      passwordUpdateError: "Error al actualizar la contraseña"
    }
  };

  return (key: string) => {
    return translations[namespace]?.[key] || key;
  };
}