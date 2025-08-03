"use client";

import { useEffect, useState } from "react";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/Button";

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/Dialog";
import { Textarea } from "../ui/Textarea";

interface RejectDocumentModalProps {
  isOpen: boolean;
  loading?: boolean;
  onClose: () => void;
  onReject: (reason: string) => void;
}

export const RejectDocumentModal = ({
  isOpen,
  loading = false,
  onClose,
  onReject,
}: RejectDocumentModalProps) => {
  const t = useTranslations("RejectDocumentModal");

  const [value, setValue] = useState("");

  useEffect(() => {
    setTimeout(() => setValue(""), 100);
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-neutral-700">{t("title")}</DialogTitle>
          <DialogDescription>{t("subtitle")}</DialogDescription>
        </DialogHeader>

        <DialogBody>
          <Textarea
            placeholder={t("inputPlaceholder")}
            onChange={(e) => setValue(e.target.value)}
            value={value}
          />
        </DialogBody>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button
            variant={!value ? "secondary" : "secondaryError"}
            onClick={() => onReject(value.trim())}
            disabled={!value || loading}
            isLoading={loading}
          >
            {t("reject")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
