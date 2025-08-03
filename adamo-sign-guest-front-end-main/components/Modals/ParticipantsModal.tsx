"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/Button";

import ParticipantCard, { Participant } from "../Card/ParticipantCard";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/Dialog";

interface ParticipantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[]; // Solo usamos esta prop ya procesada
}

export const ParticipantsModal = ({
  isOpen,
  onClose,
  participants,
}: ParticipantsModalProps) => {
  const t = useTranslations("ParticipantsModal");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-neutral-700">{t("title")}</DialogTitle>
          <DialogDescription />
        </DialogHeader>

        <DialogBody>
          <div className="space-y-2">
            {participants.map((p) => (
              <ParticipantCard key={p.recipientEmail} participant={p} />
            ))}
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            {t("accept")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
