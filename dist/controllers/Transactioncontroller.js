"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const paystack_1 = require("../services/paystack/paystack");
const hash_1 = __importDefault(require("../utils/hash"));
const checkTransaction_1 = __importDefault(require("../utils/transactions/checkTransaction"));
const db_user_1 = require("../repositories/db.user");
const validators_1 = require("../utils/validators");
const db_customer_1 = require("../repositories/db.customer");
const db_invoice_1 = require("../repositories/db.invoice");
const db_transactions_1 = require("../repositories/db.transactions");
(0, dotenv_1.configDotenv)();
class TransactionController {
    static async paymentInit({ userId, invoiceId, payerEmail, amount }) {
        const { error } = validators_1.paySchema.validate({ amount, userId, invoiceId, payerEmail });
        if (error) {
            return {
                success: false,
                message: error.message,
            };
        }
        const hashedArgs = (0, hash_1.default)(amount, userId, invoiceId, payerEmail);
        const isDuplicate = await (0, checkTransaction_1.default)(userId.toString(), hashedArgs);
        if (isDuplicate) {
            return {
                success: false,
                message: 'Duplicate transaction',
            };
        }
        const user = await (0, db_user_1.findUser)({ id: userId });
        if (!user) {
            return {
                success: false,
                message: 'User does not exist',
            };
        }
        const payer = await (0, db_customer_1.findCustomer)({ email: payerEmail });
        if (!payer) {
            return {
                success: false,
                message: 'Customer does not exist',
            };
        }
        const invoice = await (0, db_invoice_1.getInvoice)(invoiceId);
        if (!invoice) {
            return {
                success: false,
                message: 'Invoice does not exist',
            };
        }
        if (invoice.paymentStatus === 'PAID' && invoice.reference != null) {
            return {
                success: false,
                message: 'Invoice already paid',
            };
        }
        const payerDetails = `${payerEmail}:${invoiceId}`;
        const result = await (0, paystack_1.initPay)({ email: user.email, amount, metadata: { payerDetails } });
        return {
            success: true,
            message: 'Payment initialized',
            data: result,
        };
    }
    static async getTransactionHistory({ userId, limit, page, transactionType, from, to, }) {
        const { error } = validators_1.transactionHistorySchema.validate({ limit, page, transactionType, from, to });
        if (error) {
            return {
                success: false,
                message: error.message,
            };
        }
        const transactions = await (0, db_transactions_1.getTransactions)({ userId, limit, page, from, to, transactionType });
        return {
            success: true,
            message: 'Transactions fetched successfully',
            data: transactions,
        };
    }
}
exports.default = TransactionController;
//# sourceMappingURL=Transactioncontroller.js.map