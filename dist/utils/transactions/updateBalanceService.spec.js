"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const faker_1 = require("@faker-js/faker");
const jest_mock_1 = require("jest-mock");
const library_1 = require("@prisma/client/runtime/library");
const db_server_1 = __importDefault(require("../db.server"));
const updateBalanceService_1 = __importDefault(require("./updateBalanceService"));
const db_user_1 = require("../../repositories/db.user");
const db_account_1 = require("../../repositories/db.account");
const db_invoice_1 = require("../../repositories/db.invoice");
const db_transactions_1 = require("../../repositories/db.transactions");
const email_1 = require("../../services/email/email");
jest.mock('../../repositories/db.account');
jest.mock('../../repositories/db.customer');
jest.mock('../../repositories/db.invoice');
jest.mock('../../repositories/db.transactions');
jest.mock('../../repositories/db.user');
jest.mock('../../services/email/email');
// Explicit mock for prisma
jest.mock('../db.server', () => ({
    __esModule: true,
    default: {
        $transaction: jest.fn(),
    },
}));
const mockedCreditbusinessAccount = (0, jest_mock_1.mocked)(db_account_1.creditbusinessAccount);
const mockedGetBusinessAccountWithCustomer = (0, jest_mock_1.mocked)(db_account_1.getBusinessAccountWithCustomer);
const mockedUpdateInvoice = (0, jest_mock_1.mocked)(db_invoice_1.updateInvoice);
const mockedRecordTransaction = (0, jest_mock_1.mocked)(db_transactions_1.recordTransaction);
const mockedFindUser = (0, jest_mock_1.mocked)(db_user_1.findUser);
const mockedSendEmail = (0, jest_mock_1.mocked)(email_1.sendEmail);
const mockedPrisma = (0, jest_mock_1.mocked)(db_server_1.default);
describe('updateBalanceService', () => {
    const event = {
        data: {
            customer: {
                email: faker_1.faker.internet.email(),
            },
            amount: faker_1.faker.finance.amount(),
            reference: faker_1.faker.string.uuid(),
            status: 'success',
            metadata: {
                payerDetails: `${faker_1.faker.internet.email()}:1`,
            },
        },
    };
    const mockedUser = {
        id: 1,
        firstName: faker_1.faker.person.firstName(),
        lastName: faker_1.faker.person.lastName(),
        email: faker_1.faker.internet.email(),
        password: faker_1.faker.internet.password(),
        phoneNumber: faker_1.faker.phone.number(),
        createdAt: new Date(),
    };
    it('should update balance and send emails', async () => {
        const { email } = event.data.customer;
        const { amount, reference, metadata } = event.data;
        const payerDetails = metadata.payerDetails;
        const [payerEmail, invoiceId] = payerDetails.split(':');
        mockedFindUser.mockResolvedValueOnce(mockedUser);
        const mockedCreditResult = {
            id: 1,
            businessName: faker_1.faker.company.name(),
            accountNumber: faker_1.faker.finance.accountNumber(),
            accountName: faker_1.faker.company.name(),
            balance: new library_1.Decimal(faker_1.faker.finance.amount()),
            userId: 1,
            bankCode: faker_1.faker.finance.currencyCode(),
            city: faker_1.faker.location.city(),
            country: 'Nigeria',
            streetAddress: faker_1.faker.location.streetAddress(),
            customers: [
                {
                    id: 1,
                    email: payerEmail,
                    name: faker_1.faker.person.fullName(),
                    businessAccountId: 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ],
            createdAt: new Date(),
        };
        const mockedBusAccWithCustomer = {
            id: 1,
            businessName: faker_1.faker.company.name(),
            accountNumber: faker_1.faker.finance.accountNumber(),
            accountName: faker_1.faker.company.name(),
            balance: new library_1.Decimal(faker_1.faker.finance.amount()),
            userId: 1,
            bankCode: faker_1.faker.finance.currencyCode(),
            city: faker_1.faker.location.city(),
            country: 'Nigeria',
            streetAddress: faker_1.faker.location.streetAddress(),
            customers: [
                {
                    id: 1,
                    email: payerEmail,
                    name: faker_1.faker.person.fullName(),
                    businessAccountId: 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ],
            createdAt: new Date(),
        };
        const mockedInvoice = {
            id: Number(invoiceId),
            customerId: 1,
            businessAccountId: 1,
            totalAmount: new library_1.Decimal(amount),
            paymentStatus: 'PENDING',
            reference,
            createdAt: new Date(),
            updatedAt: new Date(),
            count: 1,
        };
        const mockedTxn = {
            id: 1,
            customerId: 1,
            invoiceId: Number(invoiceId),
            amount: new library_1.Decimal(amount),
            reference,
            transactionType: 'card',
            businessAccountId: 1,
            metadata,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const mockedMail = {
            accepted: [faker_1.faker.internet.email()],
            rejected: [],
            envelopeTime: 1,
            messageTime: 1,
            messageSize: 1,
            response: '250 OK',
            envelope: { from: faker_1.faker.internet.email(), to: [faker_1.faker.internet.email()] },
        };
        mockedGetBusinessAccountWithCustomer.mockResolvedValueOnce(mockedBusAccWithCustomer);
        mockedCreditbusinessAccount.mockResolvedValueOnce(mockedCreditResult);
        mockedUpdateInvoice.mockResolvedValueOnce(mockedInvoice);
        mockedRecordTransaction.mockResolvedValueOnce(mockedTxn);
        mockedPrisma.$transaction.mockImplementationOnce((callback) => callback());
        mockedSendEmail.mockResolvedValueOnce(mockedMail);
        mockedSendEmail.mockResolvedValueOnce(mockedMail);
        await expect((0, updateBalanceService_1.default)(event)).resolves.toEqual({
            success: true,
            message: 'payment successful',
        });
        expect(mockedFindUser).toHaveBeenCalledWith({ email });
        expect(mockedGetBusinessAccountWithCustomer).toHaveBeenCalledWith({ userId: 1 });
        expect(mockedCreditbusinessAccount).toHaveBeenCalledWith({
            amount,
            businessAccountId: 1,
        });
        expect(mockedUpdateInvoice).toHaveBeenCalledWith({
            invoiceId: Number(invoiceId),
            customerId: 1,
            businessAccountId: 1,
            totalAmount: amount,
            paymentStatus: 'PAID',
            reference,
        });
        expect(mockedRecordTransaction).toHaveBeenCalledWith({
            customerId: 1,
            invoiceId: Number(invoiceId),
            amount,
            reference,
            transactionType: 'card',
            businessAccountId: 1,
            metadata,
        }, 
        // undefined is passed because the transaction is mocked
        undefined);
        expect(mockedPrisma.$transaction).toHaveBeenCalledWith(expect.any(Function));
        expect(mockedSendEmail).toHaveBeenCalledWith({
            recipientEmail: payerEmail,
            templateName: 'payer-payment-successful',
            subject: 'Payment Successful',
            data: { businessName: expect.any(String), payerName: expect.any(String) },
        });
        expect(mockedSendEmail).toHaveBeenCalledWith({
            recipientEmail: email,
            templateName: 'business-payment-successful',
            subject: 'Payment Received',
            data: { businessName: expect.any(String), payerName: expect.any(String) },
        });
    });
});
//# sourceMappingURL=updateBalanceService.spec.js.map