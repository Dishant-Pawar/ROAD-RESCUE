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
  getEmergencyReports,
  getAdminStats,
  getClientStats,
  getMechanics
} from '../controllers/serviceController.js';
import { protect, optionalProtect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/incidents', protect, authorize('admin'), getRequests);
router.get('/mechanics', protect, authorize('admin'), getMechanics);
router.get('/incidents/active', protect, getActiveRequest);
router.post('/incidents', protect, createRequest);
router.put('/incidents/:id/assign', protect, authorize('admin'), assignRequest);
router.put('/incidents/:id/complete', protect, authorize('admin'), completeRequest);
router.put('/incidents/:id/cancel', protect, cancelRequest);
router.post('/incidents/:id/chat', protect, addChatMessage);

router.get('/incidents/stats/admin', protect, authorize('admin'), getAdminStats);
router.get('/incidents/stats/client', protect, getClientStats);

router.post('/emergency-reports', optionalProtect, submitEmergencyReport);
router.get('/emergency-reports', optionalProtect, getEmergencyReports);

export default router;
