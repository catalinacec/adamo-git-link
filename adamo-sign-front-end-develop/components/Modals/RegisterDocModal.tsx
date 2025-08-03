"use client";

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
import { useTranslations } from "next-intl";
import { useState } from "react";

interface RegisterDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: () => void;
  onRegister: () => Promise<void>;
}

export const RegisterDocModal = ({
  isOpen,
  onClose,
  onRegister
}: RegisterDocModalProps) => {
  const t = useTranslations("DocumentStatus");

  const [isLoading, setIsLoading] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-neutral-700">
            {t("registerBlockchainTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("registerBlockchainDescription")}
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <DialogBody>
            <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 py-0.5">
              <div className="h-full w-[115px] animate-loading-bar rounded-full bg-adamo-sign-500"></div>
            </div>
          </DialogBody>
        )}

        <DialogFooter>
          {isLoading ? (
            <></>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                {t("cancel")}
              </Button>
              <Button
                onClick={async () => {
                  setIsLoading(true);
                  await onRegister();
                  setIsLoading(false);
                }}
                disabled={isLoading}
              >
                {t("register")}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
