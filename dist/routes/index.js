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
const customer_1 = require("./routeHandlers/customer");
const invoice_1 = require("./routeHandlers/invoice");
const payment_1 = require("./routeHandlers/payment");
const paystackWebhook_1 = require("./routeHandlers/paystackWebhook");
const transaction_1 = require("./routeHandlers/transaction");
const router = express_1.default.Router();
router.get('/', home_1.getHomeHandler);
router.post('/auth/register', auth_1.registerHandler);
router.post('/auth/login', auth_1.loginHandler);
router.post('/auth/reset-password', auth_1.resetPasswordHandler);
router.post('/auth/reset-password/confirm', auth_1.confirmResetPasswordHandler);
// paystack webhook
router.post('/paystack-webhook', paystackWebhook_1.webhookHandler);
// router.use(authMiddleware);
router.post('/auth/change-password', authMiddleware_1.default, auth_1.changePasswordHandler);
// business profile routes
router.get('/business-info', authMiddleware_1.default, businessProfile_1.getBusinessDetailsHandler);
router.post('/update-business-info', authMiddleware_1.default, businessProfile_1.updateBusinessDetailsHandler);
router.post('/update-payment-info', authMiddleware_1.default, businessProfile_1.updatePaymentDetailsHandler);
// customer routes
router.get('/customer', authMiddleware_1.default, customer_1.getCustomerHandler);
router.get('/allCustomers', authMiddleware_1.default, customer_1.getAllCustomersHandler);
router.post('/update-customer', authMiddleware_1.default, customer_1.updateCustomerHandler);
router.delete('/delete-customer', authMiddleware_1.default, customer_1.deleteCustomerHandler);
router.post('/create-customer', authMiddleware_1.default, customer_1.createCustomerHandler);
// invoice routes
router.post('/create-invoice/:customerId', authMiddleware_1.default, invoice_1.createInvoiceHandler);
router.get('/invoice/:invoiceId', authMiddleware_1.default, invoice_1.getInvoiceHandler);
router.get('/all-invoices', authMiddleware_1.default, invoice_1.getAllInvoicesHandler);
// transaction routes
router.post('/payment/:invoiceId', authMiddleware_1.default, payment_1.paymentHandler);
router.get('/transactions', authMiddleware_1.default, transaction_1.getTransactionsHandler);
router.get('/verify-pay', authMiddleware_1.default, transaction_1.verifyPayHandler);
exports.default = router;
//# sourceMappingURL=index.js.map