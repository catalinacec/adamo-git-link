import { Participant } from "@/types";
import { useMediaQuery } from "usehooks-ts";

import { useEffect, useRef, useState } from "react";
import { useSwipeable } from "react-swipeable";

import { useTranslations } from "next-intl";

import { useDocMenu } from "@/context/DocMenuContext";
// import { useProfile } from "@/context/ProfileContext";
import { useSignatureData } from "@/context/SignatureContext";

import AddParticipantModal from "../Modals/AddParticipantModal";
import { DeleteParticipantModal } from "../Modals/DeleteParticipant";
import { SignDocumentModal } from "../Modals/SignDocumentModal";
import { PlusIcon, TrashIcon } from "../icon";
import AddSignature from "./AddSignature";
import { Button } from "./Button";
import { DialogDescription, DialogTitle } from "./Dialog";
import FinishDocument from "./FinishDocument";
import ParticipantCard from "./ParticipantCard";
import RenderSignature from "./RenderSignature";
import { Sheet, SheetContent } from "./Sheet";

interface DocMenuProps {
  participants: Participant[];
}

const DocMenuItem = ({
  onAddSign,
  participant,
}: {
  participant: Participant;
  onAddSign: (participant: Participant) => void;
}) => {
  const { setActiveRecipient, participants } = useSignatureData();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const handleSetActiveRecipient = () => {
    setActiveRecipient([participant]);
    onAddSign(participant);
  };

  const handleDraggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDelete(true);
  };

  return (
    <>
      <div
        onClick={handleSetActiveRecipient}
        className="flex cursor-pointer items-center gap-3 rounded-2xl px-2 py-4 hover:bg-neutral-50"
      >
        <div className="grid flex-1 gap-3">
          <div className="flex items-center gap-x-3">
            <div
              className="h-5 w-5 shrink-0 rounded-md"
              style={{ backgroundColor: participant.color }}
            />
            <span className="text-neutral-700">
              {participant.firstName} {participant.lastName}
            </span>
          </div>
          <p className="hidden truncate text-sm md:block">
            {participant.email}
          </p>
        </div>
        {participants.length > 1 && (
          <button
            onClick={handleDraggerClick}
            type="button"
            className="h-6 w-6 shrink-0 "
          >
            <TrashIcon className="text-neutral-300" />
          </button>
        )}
      </div>
      <DeleteParticipantModal
        participantEmail={participant.email}
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        participantName={`${participant.firstName} ${participant.lastName}`}
      />
    </>
  );
};

export const DocMenuContent = ({
  participants,
  onAdd,
  onAddSignature,
  onShowSignature,
  onSendDocument,
  onAddAdminSignature,
}: {
  participants: Participant[];
  onAdd?: () => void;
  onAddSignature?: (participant: Participant) => void;
  onShowSignature?: () => void;
  onSendDocument?: () => void;
  onAddAdminSignature?: () => void;
}) => {
  const t = useTranslations("DocMenuContent");
  const {
    signatures,
    setDisableButton,
    setParticipants,
    tokenOfQuery,
    isEditingSignature,
    setIsEditingSignature,
    downloadCheck,
  } = useSignatureData();

  useEffect(() => {
    if (participants) {
      const updatedParticipants = participants.map(
        (participant: Participant) => ({
          ...participant,
          color: participant.color ?? "#94F2F2",
        }),
      );

      setParticipants(updatedParticipants);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setParticipants]);

  useEffect(() => {
    const allEmailsMatch = participants.every((participant) =>
      signatures
        .filter((signature) => signature.signatureDelete === false)
        .some((signature) => signature.recipientEmail === participant.email),
    );
    setDisableButton(!allEmailsMatch);
  }, [participants, signatures, setDisableButton]);

  useEffect(() => {
    if (tokenOfQuery && onShowSignature) {
      onShowSignature();
    }
  }, [tokenOfQuery, onShowSignature]);

  return (
    <>
      {!downloadCheck && (
        <>
          {tokenOfQuery ? (
            <div className="w-[254px] lg:w-80 rounded-3xl border border-neutral-200 bg-white px-4 py-6">
              <Button
                type="button"
                className="mt-6 w-full"
                onClick={onAddAdminSignature}
              >
                Add Signature
              </Button>
              <Button
                type="button"
                className="mt-6 w-full"
                onClick={onSendDocument}
                disabled={!signatures || signatures.length === 0}
              >
                Finish Documents
              </Button>
            </div>
          ) : (
            <div className="w-[254px] lg:w-80 rounded-3xl border border-neutral-200 bg-white px-4 py-6">
              <div className="space-y-2">
                {participants.map((participant) => {
                  return (
                    <DocMenuItem
                      participant={participant}
                      key={participant.id}
                      onAddSign={(participant) => onAddSignature?.(participant)}
                    />
                  );
                })}
              </div>
              <Button type="button" className="mt-6 w-full" onClick={onAdd}>
                <PlusIcon />
                {t("addParticipant")}
              </Button>
            </div>
          )}
          <SignDocumentModal
            isOpen={isEditingSignature}
            onClose={() => setIsEditingSignature(false)}
          />
        </>
      )}
    </>
  );
};

function DocMenu({ participants }: DocMenuProps) {
  const { open, setOpen } = useDocMenu();

  const [isAddParticipantModalOpen, setIsAddParticipantModalOpen] =
    useState(false);
  const {
    signatures,
    pdfLink,
    tokenOfQuery,
    setParticipants,
    participants: participantData,
  } = useSignatureData();
  const handlers = useSwipeable({ onSwipedLeft: () => setOpen(false) });
  const isSheetVisible = useMediaQuery("(max-width: 1280px)");
  const signatureRef = useRef<{
    addSignature: ({
      activeRecipient,
    }: {
      activeRecipient: Participant;
    }) => void;
    addAdminSignature: () => void;
  } | null>(null);

  const showSignatureRef = useRef<{ showSignature: () => void } | null>(null);
  const finishSignatureRef = useRef<{
    handleFinishDocument: (args: {
      pdfLink: string;
      signatures: any[];
      queryPdfUrl: string;
    }) => void;
  } | null>(null);

  const handleAddSignature = (participant: Participant) => {
    if (
      signatureRef.current &&
      typeof signatureRef.current.addSignature === "function"
    ) {
      signatureRef.current.addSignature({ activeRecipient: participant });
    }
  };

  const handleAddAdminSignature = () => {
    if (
      signatureRef.current &&
      typeof signatureRef.current.addAdminSignature === "function"
    ) {
      signatureRef.current.addAdminSignature();
    }
  };

  const handleFinishSignature = () => {
    if (finishSignatureRef.current) {
      finishSignatureRef.current.handleFinishDocument({
        pdfLink: pdfLink as string,
        signatures: signatures,
        queryPdfUrl: tokenOfQuery as string,
      });
    } else {
      console.error("finishSignatureRef is not defined.");
    }
  };

  useEffect(() => {
    if (participants) {
      setParticipants(participants);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participants]);

  return (
    <>
      <div className="hidden xl:block">
        <DocMenuContent
          participants={participantData}
          onAdd={() => setIsAddParticipantModalOpen(true)}
          onAddSignature={handleAddSignature}
          onAddAdminSignature={handleAddAdminSignature}
          onSendDocument={handleFinishSignature}
        />
      </div>
      <Sheet open={open && isSheetVisible} onOpenChange={setOpen}>
        <SheetContent className="w-min bg-white py-12" {...handlers}>
          <DialogTitle>
            <span className="sr-only">Participants</span>
          </DialogTitle>
          <DialogDescription />
          <DocMenuContent
            participants={participants}
            onAdd={() => {
              setIsAddParticipantModalOpen(true);
              setOpen(false);
            }}
            onAddSignature={handleAddSignature}
            onAddAdminSignature={handleAddAdminSignature}
          />
        </SheetContent>
      </Sheet>

      <AddParticipantModal
        isOpen={isAddParticipantModalOpen}
        onClose={() => setIsAddParticipantModalOpen(false)}
      />

      <AddSignature ref={signatureRef} />
      <RenderSignature ref={showSignatureRef} />
      <FinishDocument ref={finishSignatureRef} />
    </>
  );
}

export default DocMenu;

const DocMenuContentStatic = ({
  participants,
  onShowSignModal,
}: {
  participants: any;
  onShowSignModal?: () => void;
}) => {
  const t = useTranslations("DocMenuContent");
  // const { email: userEmail } = useProfile();

  return (
    <div className="w-[254px] lg:w-80 rounded-3xl border border-neutral-200 bg-white px-4 py-6">
      {/* Participants List */}
      <div className="space-y-2">
        {participants.map((participant: any) => (
          <ParticipantCard key={participant.email} participant={participant} />
        ))}
      </div>

      {/* Dragger */}
      <Button type="button" className="mt-6 w-full" onClick={onShowSignModal}>
        {t("sign")}
      </Button>
    </div>
  );
};

export function DocMenuStatic({ participants, onShowSignModal }: any) {
  const { open, setOpen } = useDocMenu();

  const handlers = useSwipeable({
    onSwipedRight: () => setOpen(false),
  });

  const isSheetVisible = useMediaQuery("(max-width: 1280px)");

  return (
    <>
      <div className="hidden xl:block">
        <DocMenuContentStatic
          participants={participants}
          onShowSignModal={onShowSignModal}
        />
      </div>

      <Sheet open={open && isSheetVisible} onOpenChange={setOpen}>
        <SheetContent className="w-min bg-white py-12" {...handlers}>
          <DialogTitle>
            <span className="sr-only">Participantes</span>
          </DialogTitle>
          <DialogDescription />
          <DocMenuContentStatic
            participants={participants}
            onShowSignModal={onShowSignModal}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
