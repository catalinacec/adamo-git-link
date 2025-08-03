"use client";

import { Button } from "@/components/ui/Button";

import { Locale } from "@/i18n/config";
import { setUserLocale } from "@/services/locale";

const handleSwitch = (locale: Locale) => {
  setUserLocale(locale);
};

export const LangSwitcher = () => {
  return (
    <div className="flex gap-3">
      <Button onClick={() => handleSwitch("es")}>Switch to ES</Button>
      <Button onClick={() => handleSwitch("en")}>Switch to EN</Button>
    </div>
  );
};
