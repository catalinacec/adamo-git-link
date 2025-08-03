"use client";

import { useFormContext } from "react-hook-form";

import { useSignatureData } from "@/context/SignatureContext";

import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";

interface DeleteParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
  participantName: string;
  participantEmail: string;
}

export const DeleteParticipantModal = ({
  isOpen,
  onClose,
  participantName,
  participantEmail,
}: DeleteParticipantModalProps) => {
  const { getValues, setValue } = useFormContext();
  const { setParticipants, setSignatures, signatures } = useSignatureData();

  const participants = getValues("participants") || [];

  const handleDeleteParticipant = () => {
    const updatedParticipants = participants.filter(
      (participant: { email: string }) =>
        participant.email !== participantEmail,
    );

    setValue("participants", updatedParticipants, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });

    handleDeleteSignatures(participantEmail);
    setParticipants(updatedParticipants);

    onClose();
  };

  const handleDeleteSignatures = (email: string) => {
    signatures.forEach((signature) => {
      if (signature.recipientEmail === email) {
        const slideElement = signature.slideElement;

        if (!slideElement) {
          console.warn("Slide element not found for signature:", signature);
          return;
        }

        const signatureElements = slideElement.querySelectorAll(
          `[data-recipient-email="${email}"]`,
        );
        signatureElements.forEach((element) => {
          if (slideElement.contains(element)) {
            try {
              slideElement.removeChild(element);
            } catch (error) {
              console.error("Error removing signature element:", error);
            }
          } else {
            console.warn("Element not found as a child, skipping removal.");
          }
        });
      }
    });

    setSignatures((prevSignatures) =>
      prevSignatures.map((signature) =>
        signature.recipientEmail === email
          ? { ...signature, signatureDelete: true }
          : signature,
      ),
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-neutral-700">
            Eliminar firmante
          </DialogTitle>
          <DialogDescription>
            ¿Estás seguro que deseas eliminar el firmante?
          </DialogDescription>
          <DialogDescription>{participantName}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="secondaryError" onClick={handleDeleteParticipant}>
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
