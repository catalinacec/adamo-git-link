// src/services/AdamoIdService.ts
import axios from "axios";
import { mapParticipantToAdamoValidation } from "../../utils/transformValidations";
import { EParticipantValidation } from "../../domain/models/participant.entity";
import { AdamoIdValidation } from "../../domain/models/adamo-id.model";
import { Participant } from "../../domain/models/participant.entity";
import {
  DocumentModel,
  DocumentsRepository,
} from "../../infrastructure/repositories/documents.repository";
import { Document } from "../../domain/models/document.entity";
import { VerificationIdRepository } from "../../infrastructure/repositories/verification-id.repository";
import { VerificationIdEntity } from "../../domain/models/verification-id.entity";

export interface AdamoValidationResponse {
  statusCode: number;
  message: string;
  payload: {
    id: string;
    url: string;
  };
  errors: any[];
}

export interface AdamoStatusValidationResponse {
  status: EAdamoIdStatus;
  validateAt: string;
}

export enum EAdamoIdStatus {
  NOT_INITIATED = "NOT_INITIATED",
  FAILED = "FAILED",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
}

export class AdamoIdService {
  static async registerNewFollow(
    doc: Document,
    signer: Participant,
    token: string = ""
  ): Promise<void> {
    const docRepo = new DocumentsRepository();

    // Endpoint simulado
    const mockApiUrl =
      "https://abx2759455.execute-api.us-east-2.amazonaws.com/dev/v1/public/clients-v1/create-url-from-external";

    let finalValidations = (signer.typeValidation || [])
      .map(mapParticipantToAdamoValidation)
      .filter((v): v is AdamoIdValidation => v !== undefined);

    // Si existe "identityValidation", ponerlo al principio
    const identityIndex = finalValidations.findIndex(
      (v) => v === "identityValidation"
    );
    if (identityIndex > -1) {
      const [identityValidation] = finalValidations.splice(identityIndex, 1);
      finalValidations = [identityValidation, ...finalValidations];
    }

    try {
      const payload = {
        title: `adamo-sign-follow_${doc.documentId}_${signer.uuid}`,
        description: `Follow to sign ${doc.documentId}_${signer.uuid}`,
        lang: "es",
        email: signer.email || "",
        owner: doc.owner || "",
        name: signer.first_name || "",
        validationSettingsEnabled: finalValidations,
        faceSimilarityPercent: 10,
        documentId: doc.documentId,
        adamoSignUserId: signer.uuid,
      };

      console.log("🔗 Simulando llamada a AdamoID con payload:", payload);

      const response = await axios.post(mockApiUrl, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const payloadResponse = response.data as AdamoValidationResponse;
      console.log("✅ Respuesta OK de AdamoID:", response.data);

      // Obtener el documento y participante actual
      const document = await docRepo.findLatestVersionByDocId(doc.documentId);

      if (!document) throw new Error("Document not found");
      const participantIndex = document.participants.findIndex(
        (p: any) => p.uuid === signer.uuid
      );
      if (participantIndex === -1) throw new Error("Participant not found");
      const participant = document.participants[participantIndex];

      // Actualizar solo dataValidation y idValidation
      participant.urlValidation = payloadResponse.payload.url;
      participant.followValidId = payloadResponse.payload.id;
      participant.statusValidation = EAdamoIdStatus.NOT_INITIATED;

      // Guardar el participante actualizado en el documento y crear nueva versión
      await docRepo.updateParticipant(doc.documentId, signer.uuid, participant);
      console.log(
        `✅ Participante ${signer.uuid} actualizado con ID de follow: ${payloadResponse.payload.id}`
      );

      // console.log("✅ ID de follow de AdamoID:", mockResponse.id);
    } catch (error) {
      console.error("❌ Error simulando llamada a AdamoID:", error);
    }
  }

  static async getDataFollowAdamoService(
    doc: Document,
    signer: Participant,
    token: string = ""
  ): Promise<{
    urlValidation: string | null;
    followValidId: string | null;
    statusValidation: EAdamoIdStatus | null;
  }> {
    // Endpoint simulado
    const mockApiUrl =
      "https://abx2759455.execute-api.us-east-2.amazonaws.com/dev/v1/public/clients-v1/create-url-from-external";

    let finalValidations = (signer.typeValidation || [])
      .map(mapParticipantToAdamoValidation)
      .filter((v): v is AdamoIdValidation => v !== undefined);

    // Si existe "identityValidation", ponerlo al principio
    const identityIndex = finalValidations.findIndex(
      (v) => v === "identityValidation"
    );
    if (identityIndex > -1) {
      const [identityValidation] = finalValidations.splice(identityIndex, 1);
      finalValidations = [identityValidation, ...finalValidations];
    }

    try {
      const payload = {
        title: `adamo-sign-follow_${doc.documentId}_${signer.uuid}`,
        description: `Follow to sign ${doc.documentId}_${signer.uuid}`,
        lang: "es",
        email: signer.email || "",
        owner: doc.owner || "",
        name: signer.first_name || "",
        validationSettingsEnabled: finalValidations,
        faceSimilarityPercent: 10,
        documentId: doc.documentId,
        adamoSignUserId: signer.uuid,
      };

      console.log("🔗 Simulando llamada a AdamoID con payload:", payload);

      const response = await axios.post(mockApiUrl, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const payloadResponse = response.data as AdamoValidationResponse;
      console.log("✅ Respuesta OK de AdamoID:", payloadResponse);

      // Obtener el documento y participante actual
      // const document = await docRepo.findLatestVersionByDocId(doc.documentId);

      // if (!document) throw new Error("Document not found");
      // const participantIndex = document.participants.findIndex(
      //   (p: any) => p.uuid === signer.uuid
      // );
      // if (participantIndex === -1) throw new Error("Participant not found");
      // const participant = document.participants[participantIndex];

      // Actualizar solo dataValidation y idValidation
      // participant.urlValidation = payloadResponse.payload.url;
      // participant.followValidId = payloadResponse.payload.id;
      // participant.statusValidation = EAdamoIdStatus.NOT_INITIATED;

      const verificationIdRepo = new VerificationIdRepository();
      const verificationIdEntity = new VerificationIdEntity(
        "", // El _id se genera automáticamente por MongoDB
        signer.uuid,
        doc.documentId,
        signer.uuid,
        payloadResponse.payload.url,
        payloadResponse.payload.id,
        EAdamoIdStatus.NOT_INITIATED
      );
      await verificationIdRepo.save(verificationIdEntity);

      return {
        urlValidation: payloadResponse.payload.url,
        followValidId: payloadResponse.payload.id,
        statusValidation: EAdamoIdStatus.NOT_INITIATED,
      };
      // Guardar el participante actualizado en el documento y crear nueva versión
      // await docRepo.updateParticipant(doc.documentId, signer.uuid, participant);
      // console.log(
      //   `✅ Participante ${signer.uuid} actualizado con ID de follow: ${payloadResponse.payload.id}`
      // );

      // console.log("✅ ID de follow de AdamoID:", mockResponse.id);
    } catch (error) {
      console.error("❌ Error simulando llamada a AdamoID:", error);
    }

    return {
      urlValidation: null,
      followValidId: null,
      statusValidation: null,
    };
  }

  public static async getStatusFollowAdamoId(
    documentId: string,
    signerId: string,
    followValidId: string,
    token: string = ""
  ): Promise<{
    status: EAdamoIdStatus;
    validateAt: string;
  }> {
    const docRepo = new DocumentsRepository();

    // Endpoint simulado
    const apiUrl = `https://abx2759455.execute-api.us-east-2.amazonaws.com/dev/v1/public/clients-v1/flow-status/${followValidId}`;

    console.log("Token UPDATE ADAMO_ID=> ", token);
    try {
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const payloadResponse = response.data as AdamoStatusValidationResponse;
      console.log("✅ Respuesta OK de AdamoID:", response.data);

      // Obtener el documento y participante actual
      const document = await docRepo.findLatestVersionByDocId(documentId);

      if (!document) throw new Error("Document not found");
      const participantIndex = document.participants.findIndex(
        (p: any) => p.uuid === signerId
      );
      if (participantIndex === -1) throw new Error("Participant not found");
      const participant = document.participants[participantIndex];

      // Actualizar solo dataValidation y idValidation
      participant.statusValidation = payloadResponse.status;

      // Guardar el participante actualizado en el documento y crear nueva versión
      await docRepo.updateParticipant(documentId, signerId, participant);
      console.log(
        `✅ Participante ${signerId} actualizado con ID de follow: ${followValidId} y status: ${payloadResponse.status}`
      );

      const verificationIdRepository = new VerificationIdRepository();

      const verificationIdEntity =
        await verificationIdRepository.findByFollowValidId(followValidId);

      if (verificationIdEntity) {
        await verificationIdRepository.update(verificationIdEntity._id, {
          statusValidation: payloadResponse.status,
        });
      }

      return {
        status: payloadResponse.status,
        validateAt: payloadResponse.validateAt,
      };

      // console.log("✅ ID de follow de AdamoID:", mockResponse.id);
    } catch (error) {
      console.error("❌ Error simulando llamada a AdamoID:", error);
    }

    return {
      status: EAdamoIdStatus.NOT_INITIATED,
      validateAt: "",
    };
  }
}
