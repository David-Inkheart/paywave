// main router for the app
import express from 'express';
import authMiddleware from '../middleWares/authMiddleware';
import { changePasswordHandler, confirmResetPasswordHandler, loginHandler, registerHandler, resetPasswordHandler } from './routeHandlers/auth';
import { getHomeHandler } from './routeHandlers/home';
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
router.post('/register', registerHandler);
router.post('/login', loginHandler);
router.post('/reset-password', resetPasswordHandler);
router.post('/reset-password/confirm', confirmResetPasswordHandler);

// router.post('/paystack-webhook', webhookHandler);
// router.get('/verify-transaction', verifyTransHandler);
// router.delete('/delete-recipient', deleteRecipientHandler);
// router.get('/banks', listBanksHandler);

// use auth middleware to protect the routes below
router.use(authMiddleware);
router.post('/auth/change-password', changePasswordHandler);
// router.post('/transfer/:recipientId', transferTransactionHandler);
// router.get('/transactions', getTransactionsHandler);
// router.post('/fund', fundAccountHandler);
// router.post('/withdraw', withdrawalHandler);

export default router;
