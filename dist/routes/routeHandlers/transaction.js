"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPayHandler = exports.getTransactionsHandler = void 0;
const paystack_1 = require("../../services/paystack/paystack");
const Transactioncontroller_1 = __importDefault(require("../../controllers/Transactioncontroller"));
const pagination_1 = __importDefault(require("../../utils/pagination"));
const validators_1 = require("../../utils/validators");
const email_1 = require("../../services/email/email");
const db_customer_1 = require("../../repositories/db.customer");
const db_user_1 = require("../../repositories/db.user");
const getTransactionsHandler = async (req, res) => {
    try {
        const userId = req.userId;
        const { limit = 10, page = 1, transactionType, from, to } = req.query;
        const Page = Number(page);
        const Limit = Number(limit);
        const response = await Transactioncontroller_1.default.getTransactionHistory({
            userId,
            limit: Limit,
            page: Page,
            transactionType: transactionType,
            from: from,
            to: to,
        });
        if (!response.success) {
            return res.status(400).json({
                success: false,
                message: response.message,
            });
        }
        const paginatedTransactions = (0, pagination_1.default)({
            records: response.data?.transactions || [],
            totalItems: response.data?.totalRecords || 0,
            page: Page,
            limit: Limit,
        });
        return res.json({
            success: true,
            message: response.message,
            data: paginatedTransactions,
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.getTransactionsHandler = getTransactionsHandler;
const verifyPayHandler = async (req, res) => {
    try {
        const userId = req.userId;
        const { reference } = req.query;
        const { error } = validators_1.verifyPaySchema.validate({ reference });
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
        const response = await (0, paystack_1.verifyPay)(reference);
        const { businessName } = response.data.metadata;
        const payerEmail = response.data.metadata.payerDetails.split(':')[0];
        const payer = await (0, db_customer_1.findCustomer)({ email: payerEmail });
        const businessOwner = await (0, db_user_1.findUser)({ id: userId });
        await Promise.all([
            (0, email_1.sendEmail)({
                recipientEmail: payerEmail,
                templateName: 'payer-payment-successful',
                subject: 'Payment Successful',
                data: { businessName, payerName: payer.name },
            }),
            (0, email_1.sendEmail)({
                recipientEmail: businessOwner.email,
                templateName: 'business-payment-successful',
                subject: `Payment Received`,
                data: { businessName, payerName: payer.name },
            }),
        ]);
        if (!response.status) {
            return res.status(400).json(response);
        }
        return res.json(response);
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.verifyPayHandler = verifyPayHandler;
//# sourceMappingURL=transaction.js.map