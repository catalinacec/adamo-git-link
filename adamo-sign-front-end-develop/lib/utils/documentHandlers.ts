import { Participant, Signature } from "@/types";
import { UseFormGetValues } from "react-hook-form";
import { DocumentInputs } from "@/schemas/documentSchema";
import { Participant as ApiParticipant, Signature as ApiSignature, TokenData } from "@/api/types/DocumentsTypes";
import DocumentsUseCase from "@/api/useCases/DocumentUseCase";

interface DocumentSubmitParams {
  modifiedPdfBytes: Uint8Array;
  documentName: string;
  recipients: Participant[];
  signatures: Signature[];
  getValues: UseFormGetValues<DocumentInputs>;
  setLoading: (loading: boolean) => void;
  setSignatures: (signatures: Signature[]) => void;
  setTokens: (tokens: TokenData[]) => void;
  setDocumentResponse: (response: any) => void;
  status?: "draft" | "sent";
  options?: {
    allowReject?: boolean;
    remindEvery3Days?: boolean;
  };
  participantSendMethods?: Record<number, string>;
  participantPhoneData?: Record<number, { countryCode: string; phone: string }>;
}

export const handleDocumentSubmit = async ({
  modifiedPdfBytes,
  documentName,
  recipients,
  signatures,
  getValues,
  setLoading,
  setSignatures,
  setTokens,
  setDocumentResponse,
  status = "sent",
  options,
  participantSendMethods = {},
  participantPhoneData = {},
}: DocumentSubmitParams) => {
  try {
    setLoading(true);

    if (!modifiedPdfBytes || modifiedPdfBytes.length === 0) {
      throw new Error("Modified PDF is empty");
    }

    const pdfBlob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
    const pdfFile = new File(
      [pdfBlob],
      documentName.endsWith('.pdf') ? documentName : `${documentName}.pdf`,
      { type: "application/pdf" }
    );

    // Filtrar solo las firmas que no han sido eliminadas
    const filteredSignatures = signatures.filter(
      (signature) => !signature.signatureDelete
    );

    // Prepare signatures data
    const signaturesData: ApiSignature[] = filteredSignatures.map((signature) => ({
      recipientEmail: signature.recipientEmail,
      recipientsName: signature.recipientsName,
      signatureText: signature.signatureText,
      signatureContentFixed: signature.signatureContentFixed,
      signatureDelete: signature.signatureDelete ?? false,
      signatureIsEdit: signature.signatureIsEdit,
      slideElement: signature.slideElement?.outerHTML ?? '',
      slideIndex: signature.slideIndex,
      top: signature.top,
      left: signature.left,
      width: signature.width ?? 0,
      height: signature.height ?? 0,
      rotation: signature.rotation ?? 0,
      color: signature.color,
    }));

    // Prepare participants data
    const formParticipants = getValues().participants || [];
    const participantsData: ApiParticipant[] = recipients.map((participant, index) => {
      const verifications = formParticipants[index]?.verifications || {};
      const typeValidation = Object.entries(verifications)
        .filter(([_, value]) => value === true)
        .map(([key]) => key);

      const sendMethod = participantSendMethods[index] || 'email';
      const phoneData = participantPhoneData[index];
      
      console.log(`Participant ${index} (${participant.email}) will be sent via: ${sendMethod}`);
      if (phoneData && (sendMethod === 'whatsapp' || sendMethod === 'telegram')) {
        console.log(`Participant ${index} phone data:`, phoneData);
      }

      // Preparar datos de notificación
      const phone = phoneData ? `${phoneData.countryCode}${phoneData.phone}` : '';
      const typeNotification = sendMethod as "email" | "whatsapp" | "telegram";

      return {
        first_name: participant.firstName,
        last_name: participant.lastName,
        email: participant.email,
        phone,
        typeNotification,
        requireValidation: typeValidation.length > 0,
        typeValidation,
        signatures: signaturesData.filter(
          (sig) => sig.recipientEmail === participant.email
        ),
      };
    });

    // Create document payload
    const documentPayload = {
      participians: participantsData,
      filename: documentName,
      status,
      options,
      file: pdfFile,
    };

    // Submit document
    const response = await DocumentsUseCase.newDocument(
      documentPayload,
      new AbortController().signal
    );

    if (!response.data) {
      throw new Error("No response data from server");
    }

    setDocumentResponse(response.data);
    setSignatures([]);

    // Extract tokens from signerLink instead of separate requests
    const tokens: TokenData[] = (response.data.participants || []).map(
      (p: any) => {
        const url = p.signerLink || '';
        let token = '';
        try {
          const parsedUrl = new URL(url);
          token = parsedUrl.searchParams.get('data') || '';
        } catch {
          console.warn('Invalid signerLink URL', url);
        }
        return {
          signatureId: p.uuid,
          participantEmail: p.email,
          token,
          url,
        };
      }
    );

    setTokens(tokens);

    console.log("Document submitted successfully with notification data");
  } catch (error) {
    console.error("Document submission error:", error);
    throw error;
  } finally {
    setLoading(false);
  }
};
