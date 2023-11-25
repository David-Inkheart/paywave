"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_account_1 = require("../../repositories/db.account");
const db_customer_1 = require("../../repositories/db.customer");
const db_invoice_1 = require("../../repositories/db.invoice");
const db_transactions_1 = require("../../repositories/db.transactions");
const db_user_1 = require("../../repositories/db.user");
const db_server_1 = __importDefault(require("../db.server"));
async function updateBalance(event) {
    try {
        const { email } = event.data.customer;
        const { amount, reference, status, metadata } = event.data;
        if (status !== 'success')
            throw new Error('Transaction not successful');
        const user = await (0, db_user_1.findUser)({ email });
        const payerDetails = metadata.payerDetails;
        const [payerEmail, invoiceId] = payerDetails.split(':');
        // find customer with email
        const payer = await (0, db_customer_1.findCustomer)({ email: payerEmail });
        const businessAccount = await (0, db_account_1.findbusinessAccountbyUserId)(user.id);
        if (!businessAccount)
            throw new Error('account not found');
        await db_server_1.default.$transaction(async (tx) => {
            // credit business account
            await (0, db_account_1.creditbusinessAccount)({ amount, businessAccountId: businessAccount[0].id, txn: tx });
            // update invoice
            await (0, db_invoice_1.updateInvoice)({
                invoiceId: Number(invoiceId),
                customerId: payer.id,
                businessAccountId: businessAccount[0].id,
                totalAmount: amount,
                paymentStatus: 'PAID',
                reference,
                txn: tx,
            });
            await (0, db_transactions_1.recordTransaction)({
                invoiceId: Number(invoiceId),
                amount,
                reference,
                transactionType: 'card',
                businessAccountId: businessAccount[0].id,
                metadata,
            }, tx);
        });
    }
    catch (error) {
        console.log(error);
    }
    return {
        success: true,
        message: 'payment successful',
    };
}
exports.default = updateBalance;
//# sourceMappingURL=updateBalanceService.js.map