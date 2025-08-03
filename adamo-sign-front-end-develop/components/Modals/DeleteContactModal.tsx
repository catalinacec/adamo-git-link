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

interface DeleteContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  isLoading?: boolean;
}

export const DeleteContactModal = ({
  isOpen,
  onClose,
  onDelete,
  isLoading,
}: DeleteContactModalProps) => {
  const t = useTranslations();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-neutral-700">
            {t("deleteContactModal.title")}
          </DialogTitle>
          <DialogDescription>
            {t("deleteContactModal.description")}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button 
            variant="secondaryError"
            onClick={onDelete}
            isLoading={isLoading}
            disabled={isLoading}
          >  
            {t("deleteContactModal.accept")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
