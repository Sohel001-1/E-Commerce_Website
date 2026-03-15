import express from 'express';
import { submitInquiry, listInquiries, removeInquiry } from '../controllers/inquiryController.js';
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';

const inquiryRouter = express.Router();

inquiryRouter.post('/submit', upload.single('image'), submitInquiry);
inquiryRouter.get('/list', adminAuth, listInquiries); // Protect list with adminAuth
inquiryRouter.post('/remove', adminAuth, removeInquiry);

export default inquiryRouter;
