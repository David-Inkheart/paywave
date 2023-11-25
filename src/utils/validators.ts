import joi from 'joi';

const registerSchema = joi.object({
  firstName: joi.string().min(3).max(20).alphanum().required(),
  lastName: joi.string().min(3).max(20).alphanum().required(),
  businessName: joi.string().min(3).max(20).required(),
  phoneNumber: joi.string().min(10).max(15).required(),
  email: joi.string().email().lowercase().required(),
  password: joi.string().min(8).required(),
});

const loginSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(8).required(),
});

const idSchema = joi.number().integer().min(1).required();

const changePasswordSchema = joi.object({
  currentPassword: joi.string().min(8).required(),
  newPassword: joi
    .string()
    .min(8)
    .required()
    .disallow(joi.ref('currentPassword'))
    .messages({ 'any.invalid': 'New password must be different from old password' }),
});

const forgotPasswordSchema = joi.object({
  email: joi.string().email().required(),
});

const resetPasswordSchema = joi.object({
  email: joi.string().email().required(),
  newPassword: joi.string().min(8).required(),
  code: joi.string().required().length(5),
});

const businessDetailsSchema = joi.object({
  businessName: joi.string().min(3).max(20).required(),
  streetAddress: joi.string().min(3).max(30).required(),
  city: joi.string().min(3).max(20).required(),
  country: joi.string().valid('Nigeria', 'Ghana', 'Kenya', 'Uganda').required(),
});

const paymentDetailsSchema = joi.object({
  bankCode: joi.number().integer().min(1).required(),
  accountNumber: joi.string().min(10).max(10).required(),
  accountName: joi.string().min(3).max(30).required(),
});

const customerDetailSchema = joi.object({
  customerName: joi.string().min(3).max(30).required(),
  customerEmail: joi.string().email().required(),
});

const customerEmailSchema = joi.object({
  customerEmail: joi.string().email().required(),
});

const createInvoiceSchema = joi.object({
  userId: joi.number().integer().min(1).required(),
  customerId: joi.number().integer().min(1).required(),
  items: joi
    .array()
    .items(
      joi.object({
        name: joi.string().min(3).max(30).required(),
        description: joi.string().min(3).max(30),
        price: joi.number().integer().min(1).required(),
        quantity: joi.number().integer().min(1).required(),
      }),
    )
    .min(1)
    .required(),
});

const invoiceIdSchema = joi.number().integer().min(1).required();

const paySchema = joi.object({
  amount: joi.number().integer().min(30).required(),
  userId: idSchema,
  invoiceId: invoiceIdSchema,
  payerEmail: joi.string().email().required(),
});

const transactionHistorySchema = joi
  .object({
    limit: joi.number().integer().min(1),
    page: joi.number().integer().min(1),
    type: joi.string().valid('DEBIT', 'CREDIT'),
    sub_type: joi.string().valid('TRANSFER', 'DEPOSIT', 'WITHDRAWAL', 'BANK_CHARGE', 'POS_TRANSACTION'),
    from: joi.date().iso(),
    to: joi.date().iso(),
  })
  .with('limit', 'page')
  .with('startDate', 'endDate');

export {
  loginSchema,
  registerSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  idSchema,
  transactionHistorySchema,
  businessDetailsSchema,
  paymentDetailsSchema,
  customerDetailSchema,
  customerEmailSchema,
  createInvoiceSchema,
  invoiceIdSchema,
  paySchema,
};
