"use client";

import {
  Dialog,
  DialogBodyScroll,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";

import { Button } from "@/components/ui/Button";
import { useTranslations } from "next-intl";
import { ChevronIcon } from "../icon";

interface PrivacyFullModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export const PrivacyFullModal = ({
  isOpen,
  onClose,
  onAccept,
}: PrivacyFullModalProps) => {
  const tg = useTranslations();
  const t = useTranslations("privacyPolicy");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-full max-w-[808px] rounded-none border-none p-0 pb-10 md:rounded-2xl md:p-8"
        data-mobile-close-hidden
      >
        <DialogHeader>
          <div className="tex bg-primary p-4 text-neutral-700 md:bg-transparent md:p-0 md:text-neutral-700">
            <button
              className="inline-flex items-center gap-4 text-left"
              onClick={onClose}
            >
              <ChevronIcon className="rotate-90 transform md:hidden" />
              <DialogTitle>{t("title")}</DialogTitle>
            </button>
          </div>

          <DialogDescription>
            <span className="sr-only">{t("title")}</span>
          </DialogDescription>
        </DialogHeader>

        <DialogBodyScroll className="mt-0 md:mt-2">
          <div className="p-4 md:p-0 md:pr-3">
            <h3 className="text-lg font-semibold mb-4 text-neutral-700">
              {t("dataPrivacyNotice")}
            </h3>
            
            <div className="space-y-4 text-sm text-neutral-600">
              <p>
                {t("content.paragraph1")}
              </p>
              
              <p>
                {t("content.paragraph2")}
              </p>
              
              <p>
                {t("content.paragraph3")}
              </p>
              
              <p className="break-all">
                <a 
                  href={t("content.link")} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-adamo-sign-400 hover:underline"
                >
                  {t("content.link")}
                </a>
              </p>
              
              <p>
                {t("content.paragraph4")}
              </p>
            </div>
          </div>
        </DialogBodyScroll>

        <DialogFooter className="px-4 pb-4 md:p-0">
          <Button variant="secondary" onClick={onClose}>
            {tg("cancel")}
          </Button>
          <Button onClick={onAccept}>{tg("accept")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
