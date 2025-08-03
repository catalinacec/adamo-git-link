import { Router } from 'express';
import {
    requestSign,
    declinedDoc,
    completedDoc
} from '../controllers/DocumentsController.js';

const router = Router();

router.post('/request-sign', requestSign);
router.post('/declined-doc', declinedDoc);
router.post('/completed-doc', completedDoc);

export default router;

