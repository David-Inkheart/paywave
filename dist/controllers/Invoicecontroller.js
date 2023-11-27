"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_account_1 = require("../repositories/db.account");
const validators_1 = require("../utils/validators");
const db_invoice_1 = require("../repositories/db.invoice");
const hash_1 = __importDefault(require("../utils/hash"));
const checkTransaction_1 = __importDefault(require("../utils/transactions/checkTransaction"));
const email_1 = require("../services/email/email");
const db_customer_1 = require("../repositories/db.customer");
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
            const customerDetails = await (0, db_customer_1.findCustomer)({ id: customerId });
            if (!customerDetails) {
                return {
                    success: false,
                    error: 'Customer does not exist',
                };
            }
            // Aggregate the total amount of the invoice
            const totalAmount = items.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);
            // Payment due date is 24 hours from now
            const paymentDueDate = new Date();
            paymentDueDate.setDate(paymentDueDate.getDate() + 1);
            // indempotency for invoice creation (60secs)
            const hashedArgs = (0, hash_1.default)({ userId, customerId, totalAmount, paymentDueDate, items });
            const isDuplicate = await (0, checkTransaction_1.default)(businessAccount.businessName, hashedArgs);
            if (isDuplicate) {
                return {
                    success: false,
                    error: 'Invoice already exists',
                };
            }
            await Promise.all([
                (0, db_invoice_1.createInvoice)({ businessAccountId: businessAccount.id, customerId, totalAmount, paymentDueDate, items }),
                (0, email_1.sendEmail)({
                    recipientEmail: customerDetails.email,
                    templateName: 'invoice',
                    subject: `Invoice from ${businessAccount.businessName}`,
                    data: {
                        businessName: businessAccount.businessName,
                        customerName: customerDetails.name,
                        // divide by 100 to get the actual amount and add the currency
                        totalAmount: `${totalAmount / 100} NGN`,
                        paymentDueDate,
                        items,
                    },
                }),
            ]);
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
    static async getPaymentInvoice({ userId, invoiceId }) {
        try {
            const { error } = validators_1.invoiceIdSchema.validate(invoiceId);
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
            const invoice = await (0, db_invoice_1.getInvoice)(invoiceId);
            if (!invoice) {
                return {
                    success: false,
                    error: 'Invoice does not exist',
                };
            }
            const customerDetails = await (0, db_customer_1.findCustomer)({ id: invoice.customerId });
            // Merge the invoice and business account details
            const invoicedetails = {
                invoice: {
                    ...invoice,
                    customerName: customerDetails.name,
                    customerEmail: customerDetails.email,
                },
                businessAccount,
            };
            return {
                success: true,
                data: invoicedetails,
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Could not get invoice, please try again later',
            };
        }
    }
    static async getAllPaymentInvoices({ userId }) {
        try {
            const businessAccount = await (0, db_account_1.findbusinessAccount)({ userId });
            if (!businessAccount) {
                return {
                    success: false,
                    error: 'business account does not exist',
                };
            }
            // Get the invoices and their items
            const invoices = await (0, db_invoice_1.getAllInvoices)(businessAccount.id);
            if (!invoices) {
                return {
                    success: false,
                    error: 'Invoices do not exist',
                };
            }
            return {
                success: true,
                data: invoices,
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Could not get invoices, please try again later',
            };
        }
    }
}
exports.default = InvoiceController;
//# sourceMappingURL=Invoicecontroller.js.map