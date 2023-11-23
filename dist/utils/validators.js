"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRecipientSchema = exports.withdrawSchema = exports.verifyPaySchema = exports.fundSchema = exports.transactionHistorySchema = exports.transferMoneySchema = exports.idSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.changePasswordSchema = exports.registerSchema = exports.loginSchema = void 0;
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
const transferMoneySchema = joi_1.default.object({
    amount: joi_1.default.number().positive().required(),
    recipientId: idSchema,
    senderId: idSchema,
});
exports.transferMoneySchema = transferMoneySchema;
const fundSchema = joi_1.default.object({
    amount: joi_1.default.number().integer().min(100).required(),
    userId: idSchema,
});
exports.fundSchema = fundSchema;
const withdrawSchema = joi_1.default.object({
    accountNumber: joi_1.default.number().integer().min(10).required(),
    bankCode: joi_1.default.number().integer().min(3).required(),
    amount: joi_1.default.number().integer().min(10000).required(),
    narration: joi_1.default.string().required(),
    userId: idSchema,
});
exports.withdrawSchema = withdrawSchema;
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
const verifyPaySchema = joi_1.default.object({
    reference: joi_1.default.string().uuid().required(),
});
exports.verifyPaySchema = verifyPaySchema;
const deleteRecipientSchema = joi_1.default.object({
    // RCP_2x5j67tnnw1t98k
    recipientCode: joi_1.default.string().min(19).max(20).required(),
});
exports.deleteRecipientSchema = deleteRecipientSchema;
//# sourceMappingURL=validators.js.map