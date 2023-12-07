import { faker } from '@faker-js/faker';
import { mocked } from 'jest-mock';
import { Decimal } from '@prisma/client/runtime/library';
import { SentMessageInfo } from 'nodemailer';
import prisma from '../db.server';
import updateBalance from './updateBalanceService';
import { findUser } from '../../repositories/db.user';
import { getBusinessAccountWithCustomer, creditbusinessAccount } from '../../repositories/db.account';
import { updateInvoice } from '../../repositories/db.invoice';
import { recordTransaction } from '../../repositories/db.transactions';
import { sendEmail } from '../../services/email/email';

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

const mockedCreditbusinessAccount = mocked(creditbusinessAccount);
const mockedGetBusinessAccountWithCustomer = mocked(getBusinessAccountWithCustomer);
const mockedUpdateInvoice = mocked(updateInvoice);
const mockedRecordTransaction = mocked(recordTransaction);
const mockedFindUser = mocked(findUser);
const mockedSendEmail = mocked(sendEmail);
const mockedPrisma = mocked(prisma);

describe('updateBalanceService', () => {
  const event = {
    data: {
      customer: {
        email: faker.internet.email(),
      },
      amount: faker.finance.amount(),
      reference: faker.string.uuid(),
      status: 'success',
      metadata: {
        payerDetails: `${faker.internet.email()}:1`,
      },
    },
  };

  const mockedUser = {
    id: 1,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    phoneNumber: faker.phone.number(),
    createdAt: new Date(),
  };

  it('should update balance and send emails', async () => {
    const { email } = event.data.customer;
    const { amount, reference, metadata } = event.data;
    const payerDetails = metadata.payerDetails as string;
    const [payerEmail, invoiceId] = payerDetails.split(':');

    mockedFindUser.mockResolvedValueOnce(mockedUser);

    const mockedCreditResult = {
      id: 1,
      businessName: faker.company.name(),
      accountNumber: faker.finance.accountNumber(),
      accountName: faker.company.name(),
      balance: new Decimal(faker.finance.amount()),
      userId: 1,
      bankCode: faker.finance.currencyCode(),
      city: faker.location.city(),
      country: 'Nigeria' as const,
      streetAddress: faker.location.streetAddress(),
      customers: [
        {
          id: 1,
          email: payerEmail,
          name: faker.person.fullName(),
          businessAccountId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      createdAt: new Date(),
    };

    const mockedBusAccWithCustomer = {
      id: 1,
      businessName: faker.company.name(),
      accountNumber: faker.finance.accountNumber(),
      accountName: faker.company.name(),
      balance: new Decimal(faker.finance.amount()),
      userId: 1,
      bankCode: faker.finance.currencyCode(),
      city: faker.location.city(),
      country: 'Nigeria' as const,
      streetAddress: faker.location.streetAddress(),
      customers: [
        {
          id: 1,
          email: payerEmail,
          name: faker.person.fullName(),
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
      totalAmount: new Decimal(amount),
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
      amount: new Decimal(amount),
      reference,
      transactionType: 'card' as const,
      businessAccountId: 1,
      metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockedMail: SentMessageInfo = {
      accepted: [faker.internet.email()],
      rejected: [],
      envelopeTime: 1,
      messageTime: 1,
      messageSize: 1,
      response: '250 OK',
      envelope: { from: faker.internet.email(), to: [faker.internet.email()] },
    };

    mockedGetBusinessAccountWithCustomer.mockResolvedValueOnce(mockedBusAccWithCustomer);

    mockedCreditbusinessAccount.mockResolvedValueOnce(mockedCreditResult);

    mockedUpdateInvoice.mockResolvedValueOnce(mockedInvoice);

    mockedRecordTransaction.mockResolvedValueOnce(mockedTxn);

    mockedPrisma.$transaction.mockImplementationOnce((callback: any) => callback());

    mockedSendEmail.mockResolvedValueOnce(mockedMail);
    mockedSendEmail.mockResolvedValueOnce(mockedMail);

    await expect(updateBalance(event)).resolves.toEqual({
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
    expect(mockedRecordTransaction).toHaveBeenCalledWith(
      {
        customerId: 1,
        invoiceId: Number(invoiceId),
        amount,
        reference,
        transactionType: 'card',
        businessAccountId: 1,
        metadata,
      },
      // undefined is passed because the transaction is mocked
      undefined,
    );
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
