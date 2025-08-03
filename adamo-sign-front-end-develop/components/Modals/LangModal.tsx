"use client";
import { useState } from "react";
import { setUserLocale } from "@/services/locale";
import { useLocale, useTranslations } from "next-intl";
import { Locale, locales } from "@/i18n/config";

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";

import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface LangModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LangModal = ({ isOpen, onClose }: LangModalProps) => {
  const t = useTranslations("LangModal");
  const tg = useTranslations("Global");
  const locale = useLocale();
  const [lang, setLang] = useState(locale);

  const handleChange = () => {
    setUserLocale(lang as Locale);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-neutral-700">{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <DialogBody>
          <div className="w-full">
            <Select value={lang} onValueChange={setLang}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {locales.map((l) => (
                  <SelectItem key={l} value={l} disabled={l === locale}>
                    {tg(l)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            {tg("cancel")}
          </Button>
          <Button onClick={handleChange}>{tg("change")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
