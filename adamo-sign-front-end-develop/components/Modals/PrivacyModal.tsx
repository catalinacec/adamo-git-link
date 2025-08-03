"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Checkbox } from "@/components/ui/Checkbox";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "next-intl";

interface PrivacyModalProps {
  isOpen: boolean;
  isChecked: boolean;
  setIsChecked: (checked: boolean) => void;
  onClose: () => void;
  onShowTerms: () => void;
  onShowPrivacy: () => void;
  onConfirm: () => void;
}

export const PrivacyModal = ({
  isOpen,
  onClose,
  isChecked,
  setIsChecked,
  onShowTerms,
  onShowPrivacy,
  onConfirm,
}: PrivacyModalProps) => {
  const t = useTranslations("privacyModalText");
  const tg = useTranslations();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-neutral-700">{t("title")}</DialogTitle>
          <DialogDescription>
            {t.rich("description", { br: () => <br /> })}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-8 flex items-center space-x-6">
          <Checkbox
            id="terms"
            checked={isChecked}
            onCheckedChange={(checked) => setIsChecked(!!checked)}
          />
          <Label htmlFor="terms">
            {t.rich("termsAndPrivacy", {
              terms: (chunks) => (
                <button
                  type="button"
                  className="text-adamo-sign-400"
                  onClick={onShowTerms}
                >
                  {chunks}
                </button>
              ),
              privacy: (chunks) => (
                <button
                  type="button"
                  className="text-adamo-sign-400"
                  onClick={onShowPrivacy}
                >
                  {chunks}
                </button>
              ),
            })}
          </Label>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            {tg("cancel")}
          </Button>
          <Button disabled={!isChecked} onClick={onConfirm}>
            {tg("continue")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
