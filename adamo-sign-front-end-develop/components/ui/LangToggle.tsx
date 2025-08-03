import { useLocale, useTranslations } from "next-intl";
import { setUserLocale } from "@/services/locale";

export const LangToggle = () => {
  const t = useTranslations("languageToggle");
  const locale = useLocale();

  return (
    <button onClick={() => setUserLocale(locale === "en" ? "es" : "en")}>
      {t("label")} <span className="underline">{t("language")}</span>
    </button>
  );
};
