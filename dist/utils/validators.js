"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paySchema = exports.invoiceIdSchema = exports.createInvoiceSchema = exports.customerEmailSchema = exports.customerDetailSchema = exports.paymentDetailsSchema = exports.businessDetailsSchema = exports.transactionHistorySchema = exports.idSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.changePasswordSchema = exports.registerSchema = exports.loginSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const registerSchema = joi_1.default.object({
    firstName: joi_1.default.string().min(3).max(20).alphanum().required(),
    lastName: joi_1.default.string().min(3).max(20).alphanum().required(),
    businessName: joi_1.default.string().min(3).max(20).required(),
    phoneNumber: joi_1.default.string().min(10).max(15).required(),
    email: joi_1.default.string().email().lowercase().required(),
    password: joi_1.default.string().min(8).required(),
});
exports.registerSchema = registerSchema;
const loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(8).required(),
});
exports.loginSchema = loginSchema;
const idSchema = joi_1.default.number().integer().min(1).required();
exports.idSchema = idSchema;
const changePasswordSchema = joi_1.default.object({
    currentPassword: joi_1.default.string().min(8).required(),
    newPassword: joi_1.default
        .string()
        .min(8)
        .required()
        .disallow(joi_1.default.ref('currentPassword'))
        .messages({ 'any.invalid': 'New password must be different from old password' }),
});
exports.changePasswordSchema = changePasswordSchema;
const forgotPasswordSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
});
exports.forgotPasswordSchema = forgotPasswordSchema;
const resetPasswordSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    newPassword: joi_1.default.string().min(8).required(),
    code: joi_1.default.string().required().length(5),
});
exports.resetPasswordSchema = resetPasswordSchema;
const businessDetailsSchema = joi_1.default.object({
    businessName: joi_1.default.string().min(3).max(20).required(),
    streetAddress: joi_1.default.string().min(3).max(30).required(),
    city: joi_1.default.string().min(3).max(20).required(),
    country: joi_1.default.string().valid('Nigeria', 'Ghana', 'Kenya', 'Uganda').required(),
});
exports.businessDetailsSchema = businessDetailsSchema;
const paymentDetailsSchema = joi_1.default.object({
    bankCode: joi_1.default.number().integer().min(1).required(),
    accountNumber: joi_1.default.string().min(10).max(10).required(),
    accountName: joi_1.default.string().min(3).max(30).required(),
});
exports.paymentDetailsSchema = paymentDetailsSchema;
const customerDetailSchema = joi_1.default.object({
    customerName: joi_1.default.string().min(3).max(30).required(),
    customerEmail: joi_1.default.string().email().required(),
});
exports.customerDetailSchema = customerDetailSchema;
const customerEmailSchema = joi_1.default.object({
    customerEmail: joi_1.default.string().email().required(),
});
exports.customerEmailSchema = customerEmailSchema;
const createInvoiceSchema = joi_1.default.object({
    userId: joi_1.default.number().integer().min(1).required(),
    customerId: joi_1.default.number().integer().min(1).required(),
    items: joi_1.default
        .array()
        .items(joi_1.default.object({
        name: joi_1.default.string().min(3).max(30).required(),
        description: joi_1.default.string().min(3).max(30),
        price: joi_1.default.number().integer().min(1).required(),
        quantity: joi_1.default.number().integer().min(1).required(),
    }))
        .min(1)
        .required(),
});
exports.createInvoiceSchema = createInvoiceSchema;
const invoiceIdSchema = joi_1.default.number().integer().min(1).required();
exports.invoiceIdSchema = invoiceIdSchema;
const paySchema = joi_1.default.object({
    amount: joi_1.default.number().integer().min(30).required(),
    userId: idSchema,
    invoiceId: invoiceIdSchema,
    payerEmail: joi_1.default.string().email().required(),
});
exports.paySchema = paySchema;
const transactionHistorySchema = joi_1.default
    .object({
    limit: joi_1.default.number().integer().min(1),
    page: joi_1.default.number().integer().min(1),
    type: joi_1.default.string().valid('DEBIT', 'CREDIT'),
    sub_type: joi_1.default.string().valid('TRANSFER', 'DEPOSIT', 'WITHDRAWAL', 'BANK_CHARGE', 'POS_TRANSACTION'),
    from: joi_1.default.date().iso(),
    to: joi_1.default.date().iso(),
})
    .with('limit', 'page')
    .with('startDate', 'endDate');
exports.transactionHistorySchema = transactionHistorySchema;
//# sourceMappingURL=validators.js.map