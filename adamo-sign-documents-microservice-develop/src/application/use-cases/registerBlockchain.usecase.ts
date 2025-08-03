// src/application/use-cases/registerBlockchain.usecase.ts
import crypto from "crypto";
import { DocumentsRepository } from "../../infrastructure/repositories/documents.repository";
import {
  BlockchainService,
  SendTransactionResult,
} from "../services/blockchain.service";
import { HttpError } from "../../utils/httpError";
import { EDocumentStatus } from "../../domain/models/document.entity";
import { delay } from "../../utils/delay";
import { BlockchainInteractionRepository } from "../../infrastructure/repositories/blockchain-interaction.repository";
import { sendBlockchainRegisterConfirmEmail } from "../services/email.service";
import { UserRepository } from "../../infrastructure/repositories/user.repository";

interface RegisterOptions {
  fromQueue?: boolean;
}

export class RegisterBlockchainUseCase {
  private readonly interactionRepo = new BlockchainInteractionRepository();
  private readonly userRepo = new UserRepository();

  constructor(
    private readonly repo: DocumentsRepository,
    private readonly blockchainService: BlockchainService
  ) {}

  async execute(
    documentId: string,
    userId: string,
    options: RegisterOptions = {},
    t: (key: string, vars?: Record<string, any>) => string
  ): Promise<any> {
    // console.log("Iniciando registro en blockchain para documento:", documentId);
    // --- 1. Obtener documento (última versión) y verificar owner/participante ---
    const document = await this.repo.findLatestVersion(userId, documentId);
    if (!document) {
      // console.log("Documento no encontrado:", documentId);
      throw new HttpError(
        404,
        t("errors.resource.not_found", {
          entity: t("entities.document"),
        })
      );
    }

    // console.log("Documento encontrado:", documentId);
    // 1.a) Verificar que el usuario sea owner
    if (document.owner !== userId) {
      // console.log("Acceso denegado: el usuario no es owner del documento");
      throw new HttpError(400, t("custom.access_denied_document"));
    }

    // 1.b) Verificar que existan participantes y todos hayan firmado
    // if (document.participants.length === 0) {
    //   throw new Error("No hay participantes en el documento");
    // }

    const pending = document.participants.filter(
      (p) => !p.historySignatures.hasSigned && !p.historySignatures.hasRejected
    );

    if (pending.length > 0 || document.status !== EDocumentStatus.COMPLETED) {
      // console.log(
      //   "No todos los participantes han firmado o rechazado el documento"
      // );
      throw new HttpError(400, t("custom.not_all_participants_signed"));
    }

    // Si alguien rechazó, no se puede registrar
    // console.log("Verificando participantes rechazados");
    const rejected = document.participants.filter(
      (p) => p.historySignatures.hasRejected
    );
    // console.log("Participantes rechazados:", rejected);
    if (rejected.length > 0) {
      // console.log("Al menos un participante ha rechazado el documento");
      throw new HttpError(400, t("custom.at_least_one_participant_rejected"));
    }

    // 2. Validar si ya está registrado
    if (
      document.blockchain &&
      document.blockchain.contractId &&
      document.blockchain.transactionId
    ) {
      console.log("Documento ya registrado en blockchain:", documentId);
      throw new HttpError(400, t("custom.already_registered_in_blockchain"));
    }

    // 3. Descargar PDF desde S3 y generar SHA256
    const s3Key = document.metadata.s3Key;
    console.log("Obteniendo PDF desde S3 con key:", s3Key);
    const pdfBytes = await this.repo.getObjectBufferFromS3(s3Key);

    console.log("Descargando PDF desde S3:", s3Key);
    console.log("Tamaño del PDF:", pdfBytes.length, "bytes");
    console.log("Pdf Bytes:", pdfBytes.slice(0, 100), "...");

    const hash = crypto.createHash("sha256").update(pdfBytes).digest("hex");
    console.log("SHA256 del PDF:", hash);

    // 4. Llamar a BlockchainService con hasta 3 reintentos
    let bcResult: SendTransactionResult | undefined;
    const network = this.blockchainService.network || "default-network";
    const maxRetries = 3;
    const retryDelayMs = 2000;
    // -----------------------------------------------------
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      // 5.1 Insertar log de ATTEMPT
      await this.interactionRepo.create({
        documentId: document._id,
        userId,
        attemptNumber: attempt,
        action: "attempt",
        timestamp: new Date(),
        hash,
        network,
      });

      try {
        bcResult = await this.blockchainService.sendTransaction(hash);

        // 5.3 Insertar log de SUCCESS
        await this.interactionRepo.create({
          documentId: document._id,
          userId,
          attemptNumber: attempt,
          action: "success",
          timestamp: new Date(),
          hash,
          network,
          contractId: bcResult.contractId,
          transactionId: bcResult.transactionId,
        });

        // console.log(`BlockchainService OK en intento ${attempt}:`, bcResult);
        break; // salió bien, rompo el bucle
      } catch (err: any) {
        const msg = err.message || err.toString();

        // 5.4 Insertar log de FAILURE
        await this.interactionRepo.create({
          documentId: document._id,
          userId,
          attemptNumber: attempt,
          action: "failure",
          timestamp: new Date(),
          hash,
          network,
          errorMessage: msg,
        });

        if (attempt < maxRetries) {
          // console.log(
          //   `Intento ${attempt} falló (“${msg}”), reintentando en ${retryDelayMs}ms…`
          // );
          await delay(retryDelayMs);
          continue; // siguiente intento
        } else {
          // Ya hice el tercer intento y sigue fallando
          // console.log(
          //   `No se pudo conectar a BlockchainService tras ${maxRetries} intentos:`,
          //   msg
          // );
          throw new HttpError(500, t("custom.blockchain_service_unavailable"));
          return;
        }
      }
    }

    if (!bcResult) {
      console.log("No se obtuvo resultado de BlockchainService");
      return;
    }

    // 5. Actualizar BD con metadata de blockchain
    const doc = await this.repo.updateBlockchainData(document._id, {
      contractId: bcResult.contractId,
      transactionId: bcResult.transactionId,
      hash,
      registeredAt: bcResult.timestamp,
      status: "success",
      attempts: (document.blockchain?.attempts ?? 0) + 1,
    });

    // 7. Enviar correo de confirmación al owner
    const userData = await this.userRepo.findById(document.owner);

    await sendBlockchainRegisterConfirmEmail(
      userData?.email || "",
      {
        documentId: documentId,
        documentName: document.filename,
        contractId: bcResult.contractId,
        transactionId: bcResult.transactionId,
        network: bcResult.network,
        registeredAt: bcResult.timestamp,
        hash: hash,
      },
      t
    );

    return doc;
  }
}
