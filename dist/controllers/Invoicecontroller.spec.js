"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const faker_1 = require("@faker-js/faker");
const library_1 = require("@prisma/client/runtime/library");
const db_account_1 = require("../repositories/db.account");
const validators_1 = require("../utils/validators");
const db_invoice_1 = require("../repositories/db.invoice");
const hash_1 = __importDefault(require("../utils/hash"));
const checkTransaction_1 = __importDefault(require("../utils/transactions/checkTransaction"));
const email_1 = require("../services/email/email");
const db_customer_1 = require("../repositories/db.customer");
const Invoicecontroller_1 = __importDefault(require("./Invoicecontroller"));
jest.mock('../repositories/db.account');
jest.mock('../repositories/db.invoice');
jest.mock('../repositories/db.customer');
jest.mock('../utils/transactions/checkTransaction');
jest.mock('../services/email/email');
jest.mock('../utils/hash');
jest.mock('../utils/validators');
describe('Invoice Controller', () => {
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
    describe('createPaymentInvoice', () => {
        const customerDetails = {
            id: 1,
            name: faker_1.faker.person.fullName(),
            email: faker_1.faker.internet.email(),
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
            reference: faker_1.faker.string.uuid(),
        };
        it('should return an error if passed arguments are not valid', async () => {
            const error = new Error(faker_1.faker.lorem.sentence());
            validators_1.createInvoiceSchema.validate.mockReturnValueOnce({ error });
            const result = await Invoicecontroller_1.default.createPaymentInvoice({
                userId: faker_1.faker.number.int(),
                customerId: faker_1.faker.number.int(),
                items,
            });
            expect(result).toEqual({
                success: false,
                error: error.message,
            });
        });
        it('should return an error if the business account does not exist', async () => {
            validators_1.createInvoiceSchema.validate.mockReturnValueOnce({ error: null });
            db_account_1.getBusinessAccountWithCustomer.mockResolvedValueOnce(null);
            const result = await Invoicecontroller_1.default.createPaymentInvoice({
                userId: faker_1.faker.number.int(),
                customerId: faker_1.faker.number.int(),
                items,
            });
            expect(result).toEqual({
                success: false,
                error: 'business account does not exist',
            });
        });
        it('should return an error if the customer does not exist', async () => {
            validators_1.createInvoiceSchema.validate.mockReturnValueOnce({ error: null });
            db_account_1.getBusinessAccountWithCustomer.mockResolvedValueOnce(businessAccount);
            db_customer_1.findCustomer.mockResolvedValueOnce(null);
            const result = await Invoicecontroller_1.default.createPaymentInvoice({
                userId: faker_1.faker.number.int(),
                customerId: faker_1.faker.number.int(),
                items,
            });
            expect(result).toEqual({
                success: false,
                error: 'Customer does not exist',
            });
        });
        it('should return an error if the invoice already exists', async () => {
            validators_1.createInvoiceSchema.validate.mockReturnValueOnce({ error: null });
            db_account_1.getBusinessAccountWithCustomer.mockResolvedValueOnce(businessAccWithCustomer);
            db_customer_1.findCustomer.mockResolvedValueOnce(customerDetails);
            hash_1.default.mockReturnValueOnce('unique-hash');
            checkTransaction_1.default.mockImplementationOnce(async () => true);
            db_invoice_1.createInvoice.mockResolvedValueOnce(invoiceDetails);
            email_1.sendEmail.mockResolvedValueOnce(true);
            const result = await Invoicecontroller_1.default.createPaymentInvoice({
                userId: faker_1.faker.number.int(),
                customerId: customerDetails.id,
                items,
            });
            expect(result).toEqual({
                success: false,
                error: 'Invoice already exists',
            });
        });
        it('should create an invoice and send an email to the customer', async () => {
            validators_1.createInvoiceSchema.validate.mockReturnValueOnce({ error: null });
            db_account_1.getBusinessAccountWithCustomer.mockResolvedValueOnce(businessAccWithCustomer);
            db_customer_1.findCustomer.mockResolvedValueOnce(customerDetails);
            hash_1.default.mockReturnValueOnce('unique-hash');
            checkTransaction_1.default.mockImplementationOnce(async () => false);
            db_invoice_1.createInvoice.mockResolvedValueOnce(invoiceDetails);
            email_1.sendEmail.mockResolvedValueOnce(true);
            const result = await Invoicecontroller_1.default.createPaymentInvoice({
                userId: faker_1.faker.number.int(),
                customerId: customerDetails.id,
                items,
            });
            expect(result).toEqual({
                success: true,
                message: 'Invoice created successfully',
            });
        });
    });
    describe('getPaymentInvoice', () => {
        it('should return an error if invoiceId is invalid', async () => {
            const error = new Error(faker_1.faker.lorem.sentence());
            validators_1.invoiceIdSchema.validate.mockReturnValueOnce({ error });
            const result = await Invoicecontroller_1.default.getPaymentInvoice({
                userId: faker_1.faker.number.int(),
                invoiceId: faker_1.faker.number.int(),
            });
            expect(result).toEqual({
                success: false,
                error: error.message,
            });
        });
        it('should return an error if business account does not exist', async () => {
            validators_1.invoiceIdSchema.validate.mockReturnValueOnce({ error: null });
            db_account_1.findbusinessAccount.mockResolvedValueOnce(null);
            const result = await Invoicecontroller_1.default.getPaymentInvoice({
                userId: faker_1.faker.number.int(),
                invoiceId: faker_1.faker.number.int(),
            });
            expect(result).toEqual({
                success: false,
                error: 'business account does not exist',
            });
        });
        it('should return an error if invoice does not exist', async () => {
            validators_1.invoiceIdSchema.validate.mockReturnValueOnce({ error: null });
            db_account_1.findbusinessAccount.mockResolvedValueOnce(businessAccount);
            db_invoice_1.getInvoice.mockResolvedValueOnce(null);
            const result = await Invoicecontroller_1.default.getPaymentInvoice({
                userId: faker_1.faker.number.int(),
                invoiceId: faker_1.faker.number.int(),
            });
            expect(result).toEqual({
                success: false,
                error: 'Invoice does not exist',
            });
        });
        it('should return invoice details', async () => {
            validators_1.invoiceIdSchema.validate.mockReturnValueOnce({ error: null });
            db_account_1.findbusinessAccount.mockResolvedValueOnce(businessAccount);
            db_invoice_1.getInvoice.mockResolvedValueOnce(invoice);
            db_customer_1.findCustomer.mockResolvedValueOnce({
                id: faker_1.faker.number.int(),
                name: faker_1.faker.person.fullName(),
                email: faker_1.faker.internet.email(),
            });
            const result = await Invoicecontroller_1.default.getPaymentInvoice({
                userId: faker_1.faker.number.int(),
                invoiceId: faker_1.faker.number.int(),
            });
            const expectedInvoiceDetails = {
                invoice: {
                    ...invoice,
                    customerName: expect.any(String),
                    customerEmail: expect.any(String),
                },
                businessAccount,
            };
            expect(result).toEqual({
                success: true,
                data: expectedInvoiceDetails,
            });
        });
        it('should handle errors during invoice retrieval', async () => {
            validators_1.invoiceIdSchema.validate.mockReturnValueOnce({ error: null });
            db_account_1.findbusinessAccount.mockResolvedValueOnce(businessAccount);
            db_invoice_1.getInvoice.mockRejectedValueOnce(new Error('Error retrieving invoice'));
            const result = await Invoicecontroller_1.default.getPaymentInvoice({
                userId: faker_1.faker.number.int(),
                invoiceId: faker_1.faker.number.int(),
            });
            expect(result).toEqual({
                success: false,
                error: 'Could not get invoice, please try again later',
            });
        });
    });
    describe('getAllPaymentInvoices', () => {
        it('should return an error if business account does not exist', async () => {
            db_account_1.findbusinessAccount.mockResolvedValueOnce(null);
            const result = await Invoicecontroller_1.default.getAllPaymentInvoices({
                userId: faker_1.faker.number.int(),
            });
            expect(result).toEqual({
                success: false,
                error: 'business account does not exist',
            });
        });
        it('should return invoices', async () => {
            db_account_1.findbusinessAccount.mockResolvedValueOnce(businessAccount);
            db_invoice_1.getAllInvoices.mockResolvedValueOnce([invoice]);
            const result = await Invoicecontroller_1.default.getAllPaymentInvoices({
                userId: faker_1.faker.number.int(),
            });
            expect(result).toEqual({
                success: true,
                data: [expect.objectContaining(invoice)],
            });
        });
        it('should handle errors during invoice retrieval', async () => {
            db_account_1.findbusinessAccount.mockResolvedValueOnce(businessAccount);
            db_invoice_1.getAllInvoices.mockRejectedValueOnce(new Error('Error retrieving invoices'));
            const result = await Invoicecontroller_1.default.getAllPaymentInvoices({
                userId: faker_1.faker.number.int(),
            });
            expect(result).toEqual({
                success: false,
                error: 'Could not get invoices, please try again later',
            });
        });
    });
});
//# sourceMappingURL=Invoicecontroller.spec.js.map