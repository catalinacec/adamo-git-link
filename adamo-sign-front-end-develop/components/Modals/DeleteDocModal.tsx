"use client";

import React from "react";
import { useTranslations } from "next-intl";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";

interface DeleteDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  isLoading?: boolean;
  deleteCount?: number;
}

export const DeleteDocModal = ({
  isOpen,
  onClose,
  onDelete,
  isLoading = false,
  deleteCount = 1,
}: DeleteDocModalProps) => {
  const t = useTranslations("AppDocuments.Stats.DraftDocuments");

  const titleText =
    deleteCount > 1
      ? t("deleteTitleMultiple", { count: deleteCount })
      : t("deleteTitleSingle");
  const descriptionText =
    deleteCount > 1
      ? t("deleteDescriptionMultiple", { count: deleteCount })
      : t("deleteDescriptionSingle");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-neutral-700">{titleText}</DialogTitle>
          <DialogDescription>{descriptionText}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => {
              if (!isLoading) onClose();
            }}
            disabled={isLoading}
          >
            {t("cancel")}
          </Button>
          <Button
            variant="secondaryError"
            onClick={() => {
              if (!isLoading) onDelete();
            }}
            disabled={isLoading}
          >
            {isLoading ? t("deleting") : t("confirmDelete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
