import express from 'express';
import {
  getRequests,
  getActiveRequest,
  createRequest,
  assignRequest,
  completeRequest,
  cancelRequest,
  addChatMessage,
  submitEmergencyReport,
  getEmergencyReports
} from '../controllers/serviceController.js';
import { protect, optionalProtect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/incidents', optionalProtect, getRequests); // Optional or protect/authorize admin
router.get('/incidents/active', optionalProtect, getActiveRequest);
router.post('/incidents', optionalProtect, createRequest);
router.put('/incidents/:id/assign', optionalProtect, assignRequest); // Simplify: allow demo assigning without strict block, or strict protect if preferred. We can use optionalProtect or protect. Let's make it easy to trigger in the demo frontend.
router.put('/incidents/:id/complete', optionalProtect, completeRequest);
router.put('/incidents/:id/cancel', optionalProtect, cancelRequest);
router.post('/incidents/:id/chat', optionalProtect, addChatMessage);

router.post('/emergency-reports', optionalProtect, submitEmergencyReport);
router.get('/emergency-reports', optionalProtect, getEmergencyReports);

export default router;
