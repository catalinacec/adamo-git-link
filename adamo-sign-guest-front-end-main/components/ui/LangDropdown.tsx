"use client";

import { Locale, locales } from "@/i18n/config";
import { setUserLocale } from "@/services/locale";

import { useEffect, useState } from "react";

import { useLocale, useTranslations } from "next-intl";

import { LangIcon } from "../icon";
import { Select, SelectContent, SelectItem, SelectTrigger } from "./Select";

function LangDropdown() {
  const t = useTranslations("Lang");
  const locale = useLocale();

  const [value, setValue] = useState<Locale>(locale as Locale);

  useEffect(() => {
    setUserLocale(value as Locale);
  }, [value]);

  return (
    <Select
      defaultValue={value}
      onValueChange={(value) => setValue(value as Locale)}
    >
      <SelectTrigger className="text-white text-sm font-semibold">
        <LangIcon className="shrink-0 mr-4" />
        {value.toUpperCase()}
      </SelectTrigger>
      <SelectContent align="end" sideOffset={16} className="w-[200px]">
        {locales.map((locale) => (
          <SelectItem disabled={locale === value} key={locale} value={locale}>
            {t(locale)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default LangDropdown;
