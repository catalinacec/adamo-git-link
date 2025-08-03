import { DocumentsListResponse } from "@/api/types/DocumentsTypes";
import { Card, CardParticipant } from "@/components/Card";
import { SendIcon } from "@/components/icon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useSignatureData } from "@/context/SignatureContext";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useFormContext } from "react-hook-form";
import { useProfile } from "@/context/ProfileContext";
import { useRouter } from "next/navigation";

interface Step4Props {
  documentResponse?: DocumentsListResponse | null;
  onViewDocument?: () => void;
}

export const Step4 = ({ documentResponse, onViewDocument }: Step4Props) => {
  const { getValues } = useFormContext();
  const { tokens } = useSignatureData();
  const t = useTranslations();
  const { email: userEmail } = useProfile();
  const router = useRouter();

  const BASE_URL = "https://dev-guest-sign.adamoservices.co/documents?data=";

  const formatCreatedAt = (dateString?: string) => {
    if (!dateString) return "13/11/2024 a las 04:23 PM"; // fallback

    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      const hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const period = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;

      return `${day}/${month}/${year} a las ${displayHours}:${minutes} ${period}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "13/11/2024 a las 04:23 PM"; // fallback
    }
  };

  const handleViewClick = () => {
    if (onViewDocument) {
      onViewDocument();
    } else if (documentResponse?.metadata?.url) {
      window.open(documentResponse.metadata.url, "_blank");
    } else {
      console.error("No document URL available");
      alert("Document URL not available");
    }
  };

  const participants = getValues("participants") || [];

  const participantsWithTokens = participants.map((participant: any, index: number) => {
    const token = tokens[index]?.token ?? "TOKEN_NOT_FOUND";
    // Detect if this participant is the current user
    const isSelf = participant.email?.toLowerCase() === userEmail?.toLowerCase();
    return {
      ...participant,
      docUrl: isSelf ? undefined : `${BASE_URL}${token}`,
      isSelf,
      selfToken: isSelf ? token : undefined,
    };
  });
  return (
    <div className="space-y-6">
      <Card className="border-none px-8 pb-10 pt-0 shadow md:pt-10">
        <div className="flex flex-col md:flex-row md:items-center">
          <div className="shrink-0 p-9">
            <Image
              width={48}
              height={48}
              src="/filledIcons/check_circle.svg"
              alt=""
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-neutral-700">
              {t("step4.title")}
            </h2>
            <p className="text-neutral-700">{t("step4.description")}</p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div className="space-y-4">
            <h2 className="font-bold text-adamo-sign-700">
              {getValues("name")}
            </h2>
            <p>
              {t("step4.createdAt")}{" "}
              {formatCreatedAt(documentResponse?.createdAt)}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Badge>
              0/{participants.length} {t("step4.signs")}
            </Badge>
            <Badge>
              <SendIcon />
              {t("sent")}
            </Badge>
          </div>
        </div>
        <Button
          className="mt-10"
          type="button"
          onClick={handleViewClick}
          disabled={!documentResponse?.metadata?.url}
        >
          {t("viewDocument")}
        </Button>
      </Card>

      <Card>
        <h2 className="font-bold text-adamo-sign-700">
          {t("step4.participants")}
        </h2>

        <div className="mt-4">
          {participantsWithTokens.map((participant: any, index: number) => (
            <CardParticipant
              key={participant.id || participant.email || index}
              {...participant}
              index={index}
              onSignAsSelf={participant.isSelf
                ? () => {
                    // Guardar firmas y metadatos del usuario actual en sessionStorage y redirigir
                    if (documentResponse?.documentId && documentResponse?.participants) {
                      const self = documentResponse.participants.find(
                        (p) => p.email?.toLowerCase() === userEmail?.toLowerCase()
                      );
                      if (self && Array.isArray(self.signatures)) {
                        sessionStorage.setItem("selfSignatures", JSON.stringify(self.signatures));
                        sessionStorage.setItem("selfSignMeta", JSON.stringify({
                          documentId: documentResponse.documentId,
                          signerId: self.uuid,
                          documentName: documentResponse.filename,
                          pdfUrl: documentResponse.metadata?.url,
                          activeUser: `${self.first_name} ${self.last_name}`,
                        }));
                      }
                      router.push(`/documents/${documentResponse.documentId}/sign`);
                    }
                  }
                : undefined}
            />
          ))}
        </div>
      </Card>
    </div>
  );
};
