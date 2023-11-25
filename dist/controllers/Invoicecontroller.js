"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_account_1 = require("../repositories/db.account");
const validators_1 = require("../utils/validators");
const db_invoice_1 = require("../repositories/db.invoice");
class InvoiceController {
    static async createPaymentInvoice({ userId, customerId, items }) {
        try {
            const { error } = validators_1.createInvoiceSchema.validate({ userId, customerId, items });
            if (error) {
                return {
                    success: false,
                    error: error.message,
                };
            }
            const businessAccount = await (0, db_account_1.findbusinessAccount)({ userId });
            if (!businessAccount) {
                return {
                    success: false,
                    error: 'business account does not exist',
                };
            }
            // Aggregate the total amount of the invoice
            const totalAmount = items.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);
            // Payment due date is 24 hours from now
            const paymentDueDate = new Date();
            paymentDueDate.setDate(paymentDueDate.getDate() + 1);
            // Create the invoice and connect items
            await (0, db_invoice_1.createInvoice)({ businessAccountId: businessAccount.id, customerId, totalAmount, paymentDueDate, items });
            return {
                success: true,
                message: 'Invoice created successfully',
            };
        }
        catch (error) {
            console.log('error::::: ', error);
            return {
                success: false,
                error: 'Could not create invoice, please try again later',
            };
        }
    }
}
exports.default = InvoiceController;
//# sourceMappingURL=Invoicecontroller.js.map