"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_account_1 = require("../../repositories/db.account");
const db_invoice_1 = require("../../repositories/db.invoice");
const db_transactions_1 = require("../../repositories/db.transactions");
const db_user_1 = require("../../repositories/db.user");
const email_1 = require("../../services/email/email");
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
        // find customer with user business account
        const businessAccount = await (0, db_account_1.getBusinessAccountWithCustomer)({ userId: user.id });
        if (!businessAccount)
            throw new Error('business account not found');
        const payer = businessAccount.customers.find((customer) => customer.email === payerEmail);
        await db_server_1.default.$transaction(async (tx) => {
            // credit business account
            await (0, db_account_1.creditbusinessAccount)({ amount, businessAccountId: businessAccount.id, txn: tx });
            // update invoice
            const invoice = await (0, db_invoice_1.updateInvoice)({
                invoiceId: Number(invoiceId),
                customerId: payer.id,
                businessAccountId: businessAccount.id,
                totalAmount: amount,
                paymentStatus: 'PAID',
                reference,
                txn: tx,
            });
            if (!invoice)
                throw new Error('invoice not found');
            // record transaction
            await (0, db_transactions_1.recordTransaction)({
                customerId: payer.id,
                invoiceId: Number(invoiceId),
                amount,
                reference,
                transactionType: 'card',
                businessAccountId: businessAccount.id,
                metadata,
            }, tx);
        });
        // send email to customer and business owner
        const { businessName } = businessAccount;
        await Promise.all([
            (0, email_1.sendEmail)({
                recipientEmail: payerEmail,
                templateName: 'payer-payment-successful',
                subject: 'Payment Successful',
                data: { businessName, payerName: payer.name },
            }),
            (0, email_1.sendEmail)({
                recipientEmail: email,
                templateName: 'business-payment-successful',
                subject: `Payment Received`,
                data: { businessName, payerName: payer.name },
            }),
        ]);
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