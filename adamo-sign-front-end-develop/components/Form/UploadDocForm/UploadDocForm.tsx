"use client";

import { DocumentsListResponse } from "@/api/types/DocumentsTypes";
import ContactsUseCase from "@/api/useCases/ContactUseCase";
import { COLORS, FONT_URLS } from "@/const/documentsConst";
import { DocumentInputs, documentSchema } from "@/schemas/documentSchema";
import { zodResolver } from "@hookform/resolvers/zod";

import { useEffect, useState, useCallback } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import { useFile } from "@/context/FileContext";
import { useSignatureData } from "@/context/SignatureContext";

import { cn } from "@/lib/utils";
import { handleDocumentSubmit } from "@/lib/utils/documentHandlers";
import { processPDFWithSignatures } from "@/lib/utils/pdfUtils";

import { AppHeader } from "@/components/ui/AppHeader";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Stepper } from "@/components/ui/Stepper";

import { useToast } from "@/hooks/use-toast";

const Step1 = dynamic(() => import("./Step1").then((mod) => mod.Step1));
const Step2 = dynamic(() => import("./Step2").then((mod) => mod.Step2));
const Step3 = dynamic(() => import("./Step3").then((mod) => mod.Step3));
const Step4 = dynamic(() => import("./Step4").then((mod) => mod.Step4));

const CancelDocumentModal = dynamic(
  () => import("@/components/Modals/CancelDocumentModal"),
);
const steps = ["first", "second", "third", "fourth"];

interface UploadDocFormProps {
  isDraftMode?: boolean;
  onBack?: () => void;
  initialStep?: number;
}

export const UploadDocForm = ({
  isDraftMode = false,
  onBack,
}: UploadDocFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([0]);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [documentResponse, setDocumentResponse] =
    useState<DocumentsListResponse | null>(null);
  const { toast } = useToast();

  const {
    viewerRef,
    signatures,
    pdfLink,
    setLoading,
    documentName,
    participants,
    tokenOfQuery,
    setSignatures,
    disableButton,
    setTokens,
    resetContext,
    loading,
  } = useSignatureData();

  const { file, resetFile } = useFile();
  const t = useTranslations();
  const router = useRouter();
  const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];

  const methods = useForm<DocumentInputs>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      name: "",
      sign: false,
      sendReminder: false,
      allowRejection: false,
      participants: [
        {
          firstName: "",
          lastName: "",
          email: "",
          color: randomColor,
          listContact: false,
          verifications: {
            selfie: false,
            document: false,
            identity: false,
            facial: false,
            phone: false,
            email: false,
          },
        },
      ],
    },
  });

  // Limpia todos los campos del formulario y el contexto
  const clearAll = useCallback(() => {
    methods.reset(); // limpia los campos del formulario
    resetContext();  // limpia el contexto de firma
    resetFile();     // limpia el archivo subido
  }, [methods, resetContext, resetFile]);

  const handleBackClick = () => {
    clearAll();
    if (isDraftMode && onBack) {
      onBack();
    } else {
      setCurrentStep(0);
      router.push("/documents");
    }
  };

  const fetchFontBytes = async (fontUrl: string) => {
    const response = await fetch(fontUrl);
    if (!response.ok) throw new Error(`Failed to load font from ${fontUrl}`);
    return await response.arrayBuffer();
  };

  const handleViewDocument = () => {
    if (documentResponse?.metadata?.url) {
      window.open(documentResponse.metadata.url, "_blank");
    }
  };

  const handleNextStep = async () => {
    if (!(await methods.trigger())) return;

    if (currentStep === 1) {
      const success = await handleContactCreation();
      if (!success) return;
    }

    if (currentStep === 3) {
      // Recoger los valores actuales del formulario para opciones
      const { sendReminder = false, allowRejection = false } = methods.getValues();
      await processAndSubmitDocument({
        allowReject: allowRejection,
        remindEvery3Days: sendReminder,
      });
    } else if (currentStep < 4) {
      updateSteps();
    }
  };

  const handleContactCreation = async () => {
    const participantValues = methods.getValues("participants");
    const participantsToAdd = participantValues.filter((p) => p.listContact);

    for (const participant of participantsToAdd) {
      const dataContact = {
        firstName: participant.firstName,
        lastName: participant.lastName,
        email: participant.email,
        phone: "",
        company: "",
        position: "",
        address: { street: "" },
      };

      try {
        await ContactsUseCase.newContact(dataContact);
      } catch (err: any) {
        const message = err?.response?.data.message || err?.response.message;

        toast({
          title: message,
        });

        return false;
      }
    }

    return true;
  };

  const processAndSubmitDocument = async (options?: { allowReject?: boolean; remindEvery3Days?: boolean }) => {
    try {
      const modifiedPdfBytes = await processPDFWithSignatures({
        signatures,
        file: file as File,
        pdfLink: String(pdfLink),
        fontUrls: FONT_URLS,
        viewerRef,
        fetchFontBytes: async (url) =>
          new Uint8Array(await fetchFontBytes(url)),
      });

      // Obtener métodos de envío y datos telefónicos desde el DOM o estado global
      const participantSendMethods =
        (methods.getValues() as any).participantSendMethods || {};
      const participantPhoneData =
        (methods.getValues() as any).participantPhoneData || {};

      await handleDocumentSubmit({
        modifiedPdfBytes,
        documentName: String(documentName),
        recipients: participants,
        signatures,
        getValues: methods.getValues,
        setLoading,
        setSignatures,
        setTokens,
        setDocumentResponse,
        status: "sent",
        options,
        participantSendMethods,
        participantPhoneData,
      });

      updateSteps();
    } catch (error) {
      console.error("Error processing document:", error);
    }
  };

  const createDraft = async () => {
    try {
      const modifiedPdfBytes = await processPDFWithSignatures({
        signatures,
        file: file as File,
        pdfLink: String(pdfLink),
        fontUrls: FONT_URLS,
        viewerRef,
        fetchFontBytes: async (url) =>
          new Uint8Array(await fetchFontBytes(url)),
      });

      const participantSendMethods =
        (methods.getValues() as any).participantSendMethods || {};
      const participantPhoneData =
        (methods.getValues() as any).participantPhoneData || {};

      await handleDocumentSubmit({
        modifiedPdfBytes,
        documentName: String(documentName),
        recipients: participants,
        signatures,
        getValues: methods.getValues,
        setLoading,
        setSignatures,
        setTokens,
        setDocumentResponse,
        status: "draft",
        participantSendMethods,
        participantPhoneData,
      });

      router.push("/documents");
    } catch (error) {
      console.error("Error processing document:", error);
    }
  };

  const updateSteps = () => {
    setCompletedSteps((prev) => [...new Set([...prev, currentStep + 1])]);
    setCurrentStep(currentStep + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (tokenOfQuery) setCurrentStep(2);
    if (currentStep === 0) resetFile();
  }, [tokenOfQuery, currentStep, resetFile]);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1 />;
      case 2:
        return <Step2 />;
      case 3:
        return <Step3 />;
      case 4:
        return (
          <Step4
            documentResponse={documentResponse}
            onViewDocument={handleViewDocument}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <AppHeader
        href={isDraftMode ? undefined : "/documents"}
        onClick={handleBackClick}
        heading={isDraftMode ? t("backDraft") : t("newDocument")}
        isDocMenu={currentStep === 2}
      />

      {currentStep !== 4 && (
        <div className="sticky top-14 z-20 bg-neutral-25 py-4 lg:top-0">
          <Stepper
            steps={steps}
            currentStep={currentStep}
            onStepChange={setCurrentStep}
            completedSteps={completedSteps}
          />
        </div>
      )}

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleNextStep)} className="mt-6">
          <Container className="space-y-6 pb-[240px] sm:pb-24">
            {renderCurrentStep()}

            {!tokenOfQuery && currentStep !== 4 && (
              <div className="fixed inset-x-4 bottom-0 flex flex-col justify-end gap-6 bg-neutral-25 py-6 sm:flex-row xl:inset-x-[104px] z-20">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsCancelModalOpen(true)}
                  disabled={loading}
                >
                  {t("cancel")}
                </Button>

                <Button
                  type="button"
                  disabled={loading}
                  variant="secondary"
                  onClick={() => createDraft()}
                >
                  {t("saveInDraft")}
                </Button>

                <Button
                  type="submit"
                  className={cn(currentStep === 3 ? "block" : "hidden")}
                  disabled={loading}
                  isLoading={loading}
                >
                  {t("sendDocument")}
                </Button>

                <Button
                  disabled={currentStep === 2 ? disableButton : loading}
                  type="button"
                  onClick={handleNextStep}
                  className={cn(currentStep === 3 && "hidden")}
                  isLoading={loading}
                >
                  {t("nextStep")}
                </Button>
              </div>
            )}
          </Container>
        </form>
      </FormProvider>

      <CancelDocumentModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onDiscard={() => {
          clearAll();
          setIsCancelModalOpen(false);
        }}
      />
    </>
  );
};
