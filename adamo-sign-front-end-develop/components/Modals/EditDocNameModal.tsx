"use client";

import { DocumentInputs } from "@/schemas/documentSchema";

import { useFormContext } from "react-hook-form";

import { useTranslations } from "next-intl";

import { useSignatureData } from "@/context/SignatureContext";

import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";

import { Input } from "../ui/Input";

interface EditDocNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnter: () => void;
}

export const EditDocNameModal = ({
  isOpen,
  onClose,
  onEnter,
}: EditDocNameModalProps) => {
  const t = useTranslations();
  const { register, trigger, formState } = useFormContext<DocumentInputs>();
  const { setDocumentName } = useSignatureData();

  const handleEdit = async () => {
    const isValid = await trigger("name");
    if (isValid) {
      onEnter();
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setDocumentName(value); // Update document name when the input value changes
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-neutral-700">
            {t("EditDocNameModal.title")}
          </DialogTitle>
          <DialogDescription>
            {t("EditDocNameModal.description")}
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <Input
            {...register("name")}
            onChange={(e) => {
              const upperValue = e.target.value.toUpperCase(); 
              e.target.value = upperValue; 
              handleInputChange(e); 
            }}
            isError={Boolean(formState.errors.name)}
            helperText={formState.errors.name?.message}
          />
        </DialogBody>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button onClick={handleEdit}>{t("edit")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
