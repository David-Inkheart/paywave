// main router for the app
import express from 'express';
import authMiddleware from '../middleWares/authMiddleware';
import { changePasswordHandler, confirmResetPasswordHandler, loginHandler, registerHandler, resetPasswordHandler } from './routeHandlers/auth';
import { getHomeHandler } from './routeHandlers/home';
import { getBusinessDetailsHandler, updateBusinessDetailsHandler, updatePaymentDetailsHandler } from './routeHandlers/businessProfile';
// import { webhookHandler } from './routeHandlers/paystackWebhook';
// import {
//   deleteRecipientHandler,
//   fundAccountHandler,
//   getTransactionsHandler,
//   listBanksHandler,
//   transferTransactionHandler,
//   verifyTransHandler,
//   withdrawalHandler,
// } from './routeHandlers/transaction';

const router = express.Router();

router.get('/', getHomeHandler);
router.post('/auth/register', registerHandler);
router.post('/auth/login', loginHandler);
router.post('/auth/reset-password', resetPasswordHandler);
router.post('/auth/reset-password/confirm', confirmResetPasswordHandler);

// router.post('/paystack-webhook', webhookHandler);
// router.get('/verify-transaction', verifyTransHandler);
// router.delete('/delete-recipient', deleteRecipientHandler);
// router.get('/banks', listBanksHandler);

// use auth middleware to protect the routes below
// router.use(authMiddleware);
router.post('/auth/change-password', authMiddleware, changePasswordHandler);
router.get('/business-info', authMiddleware, getBusinessDetailsHandler);
router.post('/update-business-info', authMiddleware, updateBusinessDetailsHandler);
router.post('/update-payment-info', authMiddleware, updatePaymentDetailsHandler);
// router.post('/transfer/:recipientId', transferTransactionHandler);
// router.get('/transactions', getTransactionsHandler);
// router.post('/fund', fundAccountHandler);
// router.post('/withdraw', withdrawalHandler);

export default router;
