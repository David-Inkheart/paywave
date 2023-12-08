"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const faker_1 = require("@faker-js/faker");
const library_1 = require("@prisma/client/runtime/library");
const paystack_1 = require("../services/paystack/paystack");
const hash_1 = __importDefault(require("../utils/hash"));
const checkTransaction_1 = __importDefault(require("../utils/transactions/checkTransaction"));
const db_user_1 = require("../repositories/db.user");
const validators_1 = require("../utils/validators");
const db_invoice_1 = require("../repositories/db.invoice");
const db_transactions_1 = require("../repositories/db.transactions");
const db_account_1 = require("../repositories/db.account");
const Transactioncontroller_1 = __importDefault(require("./Transactioncontroller"));
jest.mock('../repositories/db.user');
jest.mock('../repositories/db.invoice');
jest.mock('../repositories/db.transactions');
jest.mock('../repositories/db.account');
jest.mock('../utils/transactions/checkTransaction');
jest.mock('../services/paystack/paystack');
jest.mock('../utils/hash');
jest.mock('../utils/validators');
describe('Transaction Controller', () => {
    const userId = faker_1.faker.number.int();
    const invoiceId = faker_1.faker.number.int();
    const payerEmail = faker_1.faker.internet.email();
    const amount = faker_1.faker.number.int();
    const businessAccount = {
        id: faker_1.faker.number.int(),
        businessName: faker_1.faker.company.name(),
        customers: [],
    };
    const invoice = {
        id: faker_1.faker.number.int(),
        businessAccountId: faker_1.faker.number.int(),
        customerId: faker_1.faker.number.int(),
        totalAmount: new library_1.Decimal(faker_1.faker.number.int()),
        paymentDueDate: faker_1.faker.date.future(),
        items: [
            {
                id: faker_1.faker.number.int(),
                name: faker_1.faker.commerce.productName(),
                price: new library_1.Decimal(faker_1.faker.number.int()),
                quantity: faker_1.faker.number.int(),
                description: faker_1.faker.lorem.sentence(),
                createdAt: faker_1.faker.date.past(),
                updatedAt: faker_1.faker.date.past(),
            },
        ],
        createdAt: faker_1.faker.date.past(),
        updatedAt: faker_1.faker.date.past(),
    };
    const items = [
        {
            id: faker_1.faker.number.int(),
            name: faker_1.faker.commerce.productName(),
            price: new library_1.Decimal(faker_1.faker.number.int()),
            quantity: faker_1.faker.number.int(),
            description: faker_1.faker.lorem.sentence(),
            invoiceId: faker_1.faker.number.int(),
            createdAt: faker_1.faker.date.past(),
            updatedAt: faker_1.faker.date.past(),
        },
    ];
    const customerDetails = {
        id: 1,
        name: faker_1.faker.person.fullName(),
        email: payerEmail,
    };
    const businessAccWithCustomer = {
        id: 1,
        businessName: faker_1.faker.company.name(),
        customers: [
            {
                id: customerDetails.id,
                name: customerDetails.name,
                email: customerDetails.email,
                businessAccountId: 1,
                createdAt: faker_1.faker.date.past(),
                updatedAt: faker_1.faker.date.past(),
            },
        ],
    };
    const invoiceDetails = {
        id: 1,
        businessAccountId: businessAccWithCustomer.id,
        totalAmount: 1000,
        paymentDueDate: faker_1.faker.date.future(),
        items: [
            {
                id: 1,
                name: faker_1.faker.commerce.productName(),
                price: 500,
                quantity: 2,
                description: faker_1.faker.lorem.sentence(),
                createdAt: faker_1.faker.date.past(),
                updatedAt: faker_1.faker.date.past(),
                invoiceId: 1,
            },
        ],
        createdAt: faker_1.faker.date.past(),
        updatedAt: faker_1.faker.date.past(),
        paymentStatus: 'PENDING',
        reference: null,
    };
    const paidInvoiceDetails = {
        id: 1,
        businessAccountId: businessAccWithCustomer.id,
        totalAmount: 1000,
        paymentDueDate: faker_1.faker.date.future(),
        items: [
            {
                id: 1,
                name: faker_1.faker.commerce.productName(),
                price: 500,
                quantity: 2,
                description: faker_1.faker.lorem.sentence(),
                createdAt: faker_1.faker.date.past(),
                updatedAt: faker_1.faker.date.past(),
                invoiceId: 1,
            },
        ],
        createdAt: faker_1.faker.date.past(),
        updatedAt: faker_1.faker.date.past(),
        paymentStatus: 'PAID',
        reference: faker_1.faker.string.uuid(),
    };
    describe('paymentInit', () => {
        it('should return an error if payment details are invalid', async () => {
            const error = new Error(faker_1.faker.lorem.sentence());
            validators_1.paySchema.validate.mockReturnValue({ error });
            const result = await Transactioncontroller_1.default.paymentInit({ userId, invoiceId, payerEmail, amount });
            expect(result).toEqual({
                success: false,
                message: error.message,
            });
        });
        it('should return an error if transaction is a duplicate', async () => {
            validators_1.paySchema.validate.mockReturnValue({});
            hash_1.default.mockReturnValue(faker_1.faker.lorem.sentence());
            checkTransaction_1.default.mockResolvedValue(true);
            const result = await Transactioncontroller_1.default.paymentInit({ userId, invoiceId, payerEmail, amount });
            expect(result).toEqual({
                success: false,
                message: 'Duplicate transaction',
            });
        });
        it('should return an error if user does not exist', async () => {
            validators_1.paySchema.validate.mockReturnValue({});
            hash_1.default.mockReturnValue(faker_1.faker.lorem.sentence());
            checkTransaction_1.default.mockResolvedValue(false);
            db_user_1.findUser.mockResolvedValue(null);
            const result = await Transactioncontroller_1.default.paymentInit({ userId, invoiceId, payerEmail, amount });
            expect(result).toEqual({
                success: false,
                message: 'User does not exist',
            });
        });
        it('should return an error if business account does not exist', async () => {
            validators_1.paySchema.validate.mockReturnValue({});
            hash_1.default.mockReturnValue(faker_1.faker.lorem.sentence());
            checkTransaction_1.default.mockResolvedValue(false);
            db_user_1.findUser.mockResolvedValue({});
            db_account_1.getBusinessAccountWithCustomer.mockResolvedValue(null);
            const result = await Transactioncontroller_1.default.paymentInit({ userId, invoiceId, payerEmail, amount });
            expect(result).toEqual({
                success: false,
                message: 'Business account does not exist',
            });
        });
        it('should return an error if customer does not exist', async () => {
            validators_1.paySchema.validate.mockReturnValue({});
            hash_1.default.mockReturnValue(faker_1.faker.lorem.sentence());
            checkTransaction_1.default.mockResolvedValue(false);
            db_user_1.findUser.mockResolvedValue({});
            db_account_1.getBusinessAccountWithCustomer.mockResolvedValue(businessAccount);
            const result = await Transactioncontroller_1.default.paymentInit({ userId, invoiceId, payerEmail, amount });
            expect(result).toEqual({
                success: false,
                message: 'Customer does not exist',
            });
        });
        it('should return an error if invoice does not exist', async () => {
            validators_1.paySchema.validate.mockReturnValue({});
            hash_1.default.mockReturnValue(faker_1.faker.lorem.sentence());
            checkTransaction_1.default.mockResolvedValue(false);
            db_user_1.findUser.mockResolvedValue({});
            db_account_1.getBusinessAccountWithCustomer.mockResolvedValue(businessAccWithCustomer);
            db_invoice_1.findInvoice.mockResolvedValue(null);
            const result = await Transactioncontroller_1.default.paymentInit({ userId, invoiceId, payerEmail, amount });
            expect(result).toEqual({
                success: false,
                message: 'Invoice does not exist',
            });
        });
        it('should return an error if invoice has been paid for', async () => {
            validators_1.paySchema.validate.mockReturnValue({});
            hash_1.default.mockReturnValue(faker_1.faker.lorem.sentence());
            checkTransaction_1.default.mockResolvedValue(false);
            db_user_1.findUser.mockResolvedValue({});
            db_account_1.getBusinessAccountWithCustomer.mockResolvedValue(businessAccWithCustomer);
            db_invoice_1.findInvoice.mockResolvedValue(paidInvoiceDetails);
            const result = await Transactioncontroller_1.default.paymentInit({ userId, invoiceId, payerEmail, amount });
            expect(result).toEqual({
                success: false,
                message: 'Invoice already paid',
            });
        });
        it('should return a success message if payment is successful', async () => {
            validators_1.paySchema.validate.mockReturnValue({});
            hash_1.default.mockReturnValue(faker_1.faker.lorem.sentence());
            checkTransaction_1.default.mockResolvedValue(false);
            db_user_1.findUser.mockResolvedValue({});
            db_account_1.getBusinessAccountWithCustomer.mockResolvedValue(businessAccWithCustomer);
            db_invoice_1.findInvoice.mockResolvedValue(invoiceDetails);
            paystack_1.initPay.mockResolvedValue({ success: true, message: faker_1.faker.lorem.sentence() });
            const result = await Transactioncontroller_1.default.paymentInit({ userId, invoiceId, payerEmail, amount });
            expect(result).toEqual({
                success: true,
                message: 'Payment initialized',
                data: result.data,
            });
        });
    });
    describe('getTransactionHistory', () => {
        it('should return an error if transaction details are invalid', async () => {
            const error = new Error(faker_1.faker.lorem.sentence());
            validators_1.transactionHistorySchema.validate.mockReturnValue({ error });
            const result = await Transactioncontroller_1.default.getTransactionHistory({ userId, page: 1 });
            expect(result).toEqual({
                success: false,
                message: error.message,
            });
        });
        it('should return a success message if transactions are fetched successfully', async () => {
            validators_1.transactionHistorySchema.validate.mockReturnValue({});
            db_user_1.findUser.mockResolvedValue({});
            db_transactions_1.getTransactions.mockResolvedValue({});
            const result = await Transactioncontroller_1.default.getTransactionHistory({ userId, page: 1 });
            expect(result).toEqual({
                success: true,
                message: 'Transactions fetched successfully',
                data: result.data,
            });
        });
    });
});
//# sourceMappingURL=Transactioncontroller.spec.js.map