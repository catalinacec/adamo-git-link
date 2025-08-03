"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
import { useLocale } from "next-intl";

interface TermsFullModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export const TermsFullModal: React.FC<TermsFullModalProps> = ({
  isOpen,
  onClose,
  onAccept,
}) => {
  const tg = useTranslations();
  const locale = useLocale();
  const [termsData, setTermsData] = useState<any>(null);

  // Load terms data based on locale
  useEffect(() => {
    const loadTermsData = async () => {
      try {
        const response = await import(`../../messages/termsAndConditions.${locale}.json`);
        setTermsData(response.default);
      } catch (error) {
        console.error("Error loading terms data:", error);
        // Fallback to Spanish if locale file doesn't exist
        const response = await import(`../../messages/termsAndConditions.es.json`);
        setTermsData(response.default);
      }
    };

    if (isOpen) {
      loadTermsData();
    }
  }, [isOpen, locale]);

  const [atBottom, setAtBottom] = useState(true);

  const bodyRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (!isOpen) return;

  setTimeout(() => {
    const el = bodyRef.current;

    if (!el) return;

    const hasScroll = el.scrollHeight > el.clientHeight;

    setAtBottom(!hasScroll);
  }, 0);
}, [isOpen]);

  const handleScroll = useCallback(() => {
    const el = bodyRef.current;
    if (!el) return;
    console.log("🚀 ~ handleScroll ~ el.scrollHeight:", el.scrollHeight)
    const isBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 30;
    setAtBottom(isBottom);
  }, []);

  // Don't render until terms data is loaded
  if (!termsData) {
    return null;
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        
        if (open === false && !atBottom) return;
        onClose();
      }}
    >
      <DialogContent
        className="w-full max-w-[808px] rounded-none border-none p-0 pb-14 md:rounded-2xl md:p-8"
        data-mobile-close-hidden
      >
        <DialogHeader>
          <div className="tex bg-primary p-4 text-neutral-700 text-white md:bg-transparent md:p-0 md:text-neutral-700">
            <button
              className="inline-flex items-center gap-4 text-left"
              onClick={onClose}
            >
              <ChevronIcon className="rotate-90 transform md:hidden" />
              <DialogTitle>{termsData.title}</DialogTitle>
            </button>
          </div>
          <DialogDescription>
            <span className="sr-only">{termsData.title}</span>
          </DialogDescription>
        </DialogHeader>

        <DialogBodyScroll
          className="mt-0 md:mt-2"
          ref={bodyRef}
          onScroll={handleScroll}
        >
          <div className="p-4 md:p-0 md:pr-3">
            {/* Header */}
            <div className="text-center mb-8 border-b pb-6">
              <h2 className="text-xl font-bold text-neutral-800 mb-2">
                {termsData.mainTitle}
              </h2>
              <p className="text-sm text-neutral-600 mb-1">{termsData.version}</p>
              <p className="text-sm font-semibold text-neutral-700">{termsData.company}</p>
            </div>

            {/* Content Sections */}
            <div className="space-y-6 text-sm text-neutral-700">
              {Object.keys(termsData.sections).map((sectionKey) => {
                const section = termsData.sections[sectionKey];
                return (
                  <div key={sectionKey}>
                    <h3 className="font-semibold text-base mb-3 text-neutral-800">
                      {section.title}
                    </h3>
                    <div className="leading-relaxed whitespace-pre-line">
                      {section.content}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </DialogBodyScroll>

        <DialogFooter className="px-4 pb-4 md:p-0">
          <Button variant="secondary" onClick={onClose} disabled={!atBottom}>
            {tg("cancel")}
          </Button>
          <Button onClick={onAccept} disabled={!atBottom}>
            {tg("accept")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
