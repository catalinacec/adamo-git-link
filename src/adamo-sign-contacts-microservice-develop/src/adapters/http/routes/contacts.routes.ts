import { Router } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { ContactsController } from "../controllers/contacts.controller";
import { authenticateToken } from "../../../infrastructure/middlewares/auth.middleware";

const router = Router();
/**
 * @swagger
 * tags:
 *   name: Contacts
 *   description: Contacts
 */
router.post(`/health`, asyncHandler(ContactsController.health));
router.get(
  "/",
  authenticateToken,
  asyncHandler(ContactsController.getContacts)
);
router.post(
  "/",
  authenticateToken,
  asyncHandler(ContactsController.createContact)
);
router.put(
  "/:id",
  authenticateToken,
  asyncHandler(ContactsController.updateContact)
);
router.delete(
  "/:id",
  authenticateToken,
  asyncHandler(ContactsController.deleteContact)
);
router.post(
  "/bulk-delete",
  authenticateToken,
  asyncHandler(ContactsController.bulkDeleteContacts)
);
// router.post(
//   "/contacts/:id/restore",
//   authenticateToken,
//   asyncHandler(ContactsController.restoreContact)
// );

export default router;
