import en from "./locales/en.json";
import es from "./locales/es.json";

function getByPath(obj: any, path: string): any {
  return path.split(".").reduce((acc, part) => acc?.[part], obj);
}

function applyTemplate(str: string, vars?: Record<string, any>): string {
  if (!vars) return str;
  return str.replace(/{{\s*(\w+)\s*}}/g, (_, key) => {
    const value = vars[key];
    return typeof value === "string" || typeof value === "number"
      ? String(value)
      : "";
  });
}

const translations: Record<string, any> = {
  en,
  es,
};

export function getI18n(language: string = "en") {
  const lang = translations[language] ? language : "en";

  return (key: string, vars?: Record<string, any>): string => {
    const value = getByPath(translations[lang], key) ?? key;
    return typeof value === "string" ? applyTemplate(value, vars) : key;
  };
}

export function resolveLanguage(acceptLanguage?: string): string {
  const supported = Object.keys(translations); // ["en", "es", "fr", etc.]
  if (!acceptLanguage) return "en";

  const requested = acceptLanguage
    .split(",")
    .map((lang) => lang.trim().split("-")[0]);

  for (const lang of requested) {
    if (supported.includes(lang)) return lang;
  }

  return "en";
}
