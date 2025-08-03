import { useEffect, useState } from "react";

export function useLocale() {
  const [locale, setLocale] = useState<string>("en");

  useEffect(() => {
    // Obtener el idioma desde la URL o configuración del navegador
    const currentLocale = window.location.pathname.split("/")[1];
    if (currentLocale && ["en", "es"].includes(currentLocale)) {
      setLocale(currentLocale);
    } else {
      // Fallback al idioma del navegador
      const browserLang = navigator.language.split("-")[0];
      setLocale(["en", "es"].includes(browserLang) ? browserLang : "en");
    }
  }, []);

  return locale;
}
