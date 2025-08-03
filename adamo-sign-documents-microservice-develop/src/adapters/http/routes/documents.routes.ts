import { Router } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { DocumentsController } from "../controllers/documents.controller";
import upload from "../../../infrastructure/middlewares/upload.middleware";
import { authenticateToken } from "../../../infrastructure/middlewares/auth.middleware";

const router = Router();

router.get("/health", asyncHandler(DocumentsController.healthCheck));

// Documents routes
router.get(
  "/",
  authenticateToken,
  asyncHandler(DocumentsController.getDocuments)
);

router.post(
  "/",
  upload.single("file"),
  authenticateToken,
  asyncHandler(DocumentsController.createDocument)
);

router.patch(
  "/documents/:id",
  upload.single("file"),
  authenticateToken,
  asyncHandler(DocumentsController.updateDocument)
);

router.get(
  "/pending-signature",
  authenticateToken,
  asyncHandler(DocumentsController.getPendingSignatureDocuments)
);

router.get(
  "/:id",
  authenticateToken,
  asyncHandler(DocumentsController.getDocumentById)
);

router.patch(
  "/:id",
  upload.single("file"),
  authenticateToken,
  asyncHandler(DocumentsController.updateDocument)
);

router.delete(
  "/:id",
  authenticateToken,
  asyncHandler(DocumentsController.deleteDocument)
);

router.patch(
  "/:id/status",
  authenticateToken,
  asyncHandler(DocumentsController.changeStatus)
);

router.post(
  "/:id/rejected",
  authenticateToken,
  asyncHandler(DocumentsController.rejectDocument)
);

router.post(
  "/bulk-delete",
  authenticateToken,
  asyncHandler(DocumentsController.bulkDeleteDocuments)
);

router.post(
  "/bulk-delete-permanently",
  authenticateToken,
  asyncHandler(DocumentsController.bulkDeleteDocumentsPermanently)
);

router.post(
  "/bulk-restore",
  authenticateToken,
  asyncHandler(DocumentsController.bulkRestoreDocuments)
);

router.post(
  "/:id/register-blockchain",
  authenticateToken,
  asyncHandler(DocumentsController.registerDocumentOnBlockchain)
);

// Draft routes
router.get(
  "/:id/versions",
  authenticateToken,
  asyncHandler(DocumentsController.listVersionsByDocId)
);

router.post(
  "/:id/rollback",
  authenticateToken,
  asyncHandler(DocumentsController.rollbackDocument)
);

router.post(
  "/:id/restore",
  authenticateToken,
  asyncHandler(DocumentsController.restoreDocument)
);

//  Signers routes
router.post(
  "/:id/signers",
  authenticateToken,
  asyncHandler(DocumentsController.addSigner)
);

router.patch(
  "/:id/signers/:signerId",
  authenticateToken,
  asyncHandler(DocumentsController.updateSigner)
);

router.delete(
  "/:id/signers/:signerId",
  authenticateToken,
  asyncHandler(DocumentsController.deleteSigner)
);

router.post(
  "/:id/signers/:signerId/link",
  authenticateToken,
  asyncHandler(DocumentsController.generateSigningLink)
);

router.post(
  "/sign/:token",
  asyncHandler(DocumentsController.validateSigningLink)
);

router.post(
  "/:documentId/signer/:signerId/notify",
  authenticateToken,
  asyncHandler(DocumentsController.notifySigner)
);

router.post(
  "/:id/notify",
  authenticateToken,
  asyncHandler(DocumentsController.notifySigners)
);

router.post(
  "/:id/signer/:signerId",
  upload.any(),
  asyncHandler(DocumentsController.signSignerDocument)
);

router.post(
  "/:id/sign/:signerId",
  upload.any(),
  authenticateToken,
  asyncHandler(DocumentsController.signSignerOwnerDocument)
);

router.post(
  "/:id/signer/:signerId/resign",
  upload.any(),
  authenticateToken,
  asyncHandler(DocumentsController.reSignSignerDocument)
);

router.post(
  "/verify-signature",
  authenticateToken,
  asyncHandler(DocumentsController.verifySignature)
);

router.post(
  "/verify-document",
  authenticateToken,
  asyncHandler(DocumentsController.verifySignatureDocument)
);

// ENDPOINTS FOR ADAMO ID
router.get(
  "/:documentId/signer/:signerId/validation/:followId",
  authenticateToken,
  asyncHandler(DocumentsController.getCurrentStatusAdamoIdSigner)
);

router.post(
  "/validation/:followId",
  authenticateToken,
  asyncHandler(DocumentsController.updateStatusAdamoIdSigner)
);

export default router;
