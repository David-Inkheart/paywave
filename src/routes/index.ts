// main router for the app
import express from 'express';
import authMiddleware from '../middleWares/authMiddleware';
import { changePasswordHandler, confirmResetPasswordHandler, loginHandler, registerHandler, resetPasswordHandler } from './routeHandlers/auth';
import { getHomeHandler } from './routeHandlers/home';
import { getBusinessDetailsHandler, updateBusinessDetailsHandler, updatePaymentDetailsHandler } from './routeHandlers/businessProfile';
import {
  createCustomerHandler,
  deleteCustomerHandler,
  getAllCustomersHandler,
  getCustomerHandler,
  updateCustomerHandler,
} from './routeHandlers/customer';
import { createInvoiceHandler, getAllInvoicesHandler, getInvoiceHandler } from './routeHandlers/invoice';
import { paymentHandler } from './routeHandlers/payment';
import { webhookHandler } from './routeHandlers/paystackWebhook';

const router = express.Router();

router.get('/', getHomeHandler);
router.post('/auth/register', registerHandler);
router.post('/auth/login', loginHandler);
router.post('/auth/reset-password', resetPasswordHandler);
router.post('/auth/reset-password/confirm', confirmResetPasswordHandler);

// paystack webhook
router.post('/paystack-webhook', webhookHandler);

// router.use(authMiddleware);
router.post('/auth/change-password', authMiddleware, changePasswordHandler);

// business profile routes
router.get('/business-info', authMiddleware, getBusinessDetailsHandler);
router.post('/update-business-info', authMiddleware, updateBusinessDetailsHandler);
router.post('/update-payment-info', authMiddleware, updatePaymentDetailsHandler);

// customer routes
router.get('/customer', authMiddleware, getCustomerHandler);
router.get('/allCustomers', authMiddleware, getAllCustomersHandler);
router.post('/update-customer', authMiddleware, updateCustomerHandler);
router.delete('/delete-customer', authMiddleware, deleteCustomerHandler);
router.post('/create-customer', authMiddleware, createCustomerHandler);

// invoice routes
router.post('/create-invoice/:customerId', authMiddleware, createInvoiceHandler);
router.get('/invoice/:invoiceId', authMiddleware, getInvoiceHandler);
router.get('/all-invoices', authMiddleware, getAllInvoicesHandler);

// transaction routes
router.post('/payment/:invoiceId', authMiddleware, paymentHandler);

export default router;
