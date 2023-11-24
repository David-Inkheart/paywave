"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// main router for the app
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = __importDefault(require("../middleWares/authMiddleware"));
const auth_1 = require("./routeHandlers/auth");
const home_1 = require("./routeHandlers/home");
const businessProfile_1 = require("./routeHandlers/businessProfile");
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
const router = express_1.default.Router();
router.get('/', home_1.getHomeHandler);
router.post('/auth/register', auth_1.registerHandler);
router.post('/auth/login', auth_1.loginHandler);
router.post('/auth/reset-password', auth_1.resetPasswordHandler);
router.post('/auth/reset-password/confirm', auth_1.confirmResetPasswordHandler);
// router.post('/paystack-webhook', webhookHandler);
// router.get('/verify-transaction', verifyTransHandler);
// router.delete('/delete-recipient', deleteRecipientHandler);
// router.get('/banks', listBanksHandler);
// use auth middleware to protect the routes below
// router.use(authMiddleware);
router.post('/auth/change-password', authMiddleware_1.default, auth_1.changePasswordHandler);
router.get('/business-info', authMiddleware_1.default, businessProfile_1.getBusinessDetailsHandler);
router.post('/update-business-info', authMiddleware_1.default, businessProfile_1.updateBusinessDetailsHandler);
router.post('/update-payment-info', authMiddleware_1.default, businessProfile_1.updatePaymentDetailsHandler);
// router.post('/transfer/:recipientId', transferTransactionHandler);
// router.get('/transactions', getTransactionsHandler);
// router.post('/fund', fundAccountHandler);
// router.post('/withdraw', withdrawalHandler);
exports.default = router;
//# sourceMappingURL=index.js.map