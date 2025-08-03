"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";

interface CancelDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDiscard: () => void;
}

function CancelDocumentModal({
  isOpen,
  onClose,
  onDiscard,
}: CancelDocumentModalProps) {
  const t = useTranslations("CancelDocumentModal");
  const tg = useTranslations("Global");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-neutral-700">{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            {tg("cancel")}
          </Button>
          <Button variant="secondaryError" onClick={onDiscard}>
            {t("discardButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CancelDocumentModal;
