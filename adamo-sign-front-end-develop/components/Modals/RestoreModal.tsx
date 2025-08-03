"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";

import { Button } from "@/components/ui/Button";
import { useTranslations } from "next-intl";

interface RestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestore: () => void;
}

export const RestoreModal = ({
  isOpen,
  onClose,
  onRestore,
}: RestoreModalProps) => {
  const t = useTranslations("AppDocuments");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-neutral-700">
            {t("RestoreModal.title")}
          </DialogTitle>
          <DialogDescription>
            {t("RestoreModal.description")}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button 
            variant="secondary" 
            onClick={onClose}
          >
            {t("RestoreModal.cancel")}
          </Button>
          <Button 
            onClick={onRestore}
          >{t("RestoreModal.restore")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
