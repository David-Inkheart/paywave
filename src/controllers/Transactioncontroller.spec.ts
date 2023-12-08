import { faker } from '@faker-js/faker';
import { Item } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { initPay } from '../services/paystack/paystack';
import hashArguments from '../utils/hash';
import isDuplicateTxn from '../utils/transactions/checkTransaction';
import { findUser } from '../repositories/db.user';
import { paySchema, transactionHistorySchema } from '../utils/validators';
import { findInvoice } from '../repositories/db.invoice';
import { getTransactions } from '../repositories/db.transactions';
import { getBusinessAccountWithCustomer } from '../repositories/db.account';

import TransactionController from './Transactioncontroller';

jest.mock('../repositories/db.user');
jest.mock('../repositories/db.invoice');
jest.mock('../repositories/db.transactions');
jest.mock('../repositories/db.account');
jest.mock('../utils/transactions/checkTransaction');
jest.mock('../services/paystack/paystack');
jest.mock('../utils/hash');
jest.mock('../utils/validators');

describe('Transaction Controller', () => {
  const userId = faker.number.int();
  const invoiceId = faker.number.int();
  const payerEmail = faker.internet.email();
  const amount = faker.number.int();

  const businessAccount = {
    id: faker.number.int(),
    businessName: faker.company.name(),
    customers: [],
  };

  const invoice = {
    id: faker.number.int(),
    businessAccountId: faker.number.int(),
    customerId: faker.number.int(),
    totalAmount: new Decimal(faker.number.int()),
    paymentDueDate: faker.date.future(),
    items: [
      {
        id: faker.number.int(),
        name: faker.commerce.productName(),
        price: new Decimal(faker.number.int()),
        quantity: faker.number.int(),
        description: faker.lorem.sentence(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.past(),
      },
    ],
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
  };

  const items: Item[] = [
    {
      id: faker.number.int(),
      name: faker.commerce.productName(),
      price: new Decimal(faker.number.int()),
      quantity: faker.number.int(),
      description: faker.lorem.sentence(),
      invoiceId: faker.number.int(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.past(),
    },
  ];

  const customerDetails = {
    id: 1,
    name: faker.person.fullName(),
    email: payerEmail,
  };

  const businessAccWithCustomer = {
    id: 1,
    businessName: faker.company.name(),
    customers: [
      {
        id: customerDetails.id,
        name: customerDetails.name,
        email: customerDetails.email,
        businessAccountId: 1,
        createdAt: faker.date.past(),
        updatedAt: faker.date.past(),
      },
    ],
  };

  const invoiceDetails = {
    id: 1,
    businessAccountId: businessAccWithCustomer.id,
    totalAmount: 1000,
    paymentDueDate: faker.date.future(),
    items: [
      {
        id: 1,
        name: faker.commerce.productName(),
        price: 500,
        quantity: 2,
        description: faker.lorem.sentence(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.past(),
        invoiceId: 1,
      },
    ],
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
    paymentStatus: 'PENDING',
    reference: null,
  };

  const paidInvoiceDetails = {
    id: 1,
    businessAccountId: businessAccWithCustomer.id,
    totalAmount: 1000,
    paymentDueDate: faker.date.future(),
    items: [
      {
        id: 1,
        name: faker.commerce.productName(),
        price: 500,
        quantity: 2,
        description: faker.lorem.sentence(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.past(),
        invoiceId: 1,
      },
    ],
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
    paymentStatus: 'PAID',
    reference: faker.string.uuid(),
  };

  describe('paymentInit', () => {
    it('should return an error if payment details are invalid', async () => {
      const error = new Error(faker.lorem.sentence());
      (paySchema.validate as jest.Mock).mockReturnValue({ error });

      const result = await TransactionController.paymentInit({ userId, invoiceId, payerEmail, amount });

      expect(result).toEqual({
        success: false,
        message: error.message,
      });
    });

    it('should return an error if transaction is a duplicate', async () => {
      (paySchema.validate as jest.Mock).mockReturnValue({});

      (hashArguments as jest.Mock).mockReturnValue(faker.lorem.sentence());

      (isDuplicateTxn as jest.Mock).mockResolvedValue(true);

      const result = await TransactionController.paymentInit({ userId, invoiceId, payerEmail, amount });

      expect(result).toEqual({
        success: false,
        message: 'Duplicate transaction',
      });
    });

    it('should return an error if user does not exist', async () => {
      (paySchema.validate as jest.Mock).mockReturnValue({});

      (hashArguments as jest.Mock).mockReturnValue(faker.lorem.sentence());

      (isDuplicateTxn as jest.Mock).mockResolvedValue(false);

      (findUser as jest.Mock).mockResolvedValue(null);

      const result = await TransactionController.paymentInit({ userId, invoiceId, payerEmail, amount });

      expect(result).toEqual({
        success: false,
        message: 'User does not exist',
      });
    });

    it('should return an error if business account does not exist', async () => {
      (paySchema.validate as jest.Mock).mockReturnValue({});

      (hashArguments as jest.Mock).mockReturnValue(faker.lorem.sentence());

      (isDuplicateTxn as jest.Mock).mockResolvedValue(false);

      (findUser as jest.Mock).mockResolvedValue({});

      (getBusinessAccountWithCustomer as jest.Mock).mockResolvedValue(null);

      const result = await TransactionController.paymentInit({ userId, invoiceId, payerEmail, amount });

      expect(result).toEqual({
        success: false,
        message: 'Business account does not exist',
      });
    });

    it('should return an error if customer does not exist', async () => {
      (paySchema.validate as jest.Mock).mockReturnValue({});

      (hashArguments as jest.Mock).mockReturnValue(faker.lorem.sentence());

      (isDuplicateTxn as jest.Mock).mockResolvedValue(false);

      (findUser as jest.Mock).mockResolvedValue({});

      (getBusinessAccountWithCustomer as jest.Mock).mockResolvedValue(businessAccount);

      const result = await TransactionController.paymentInit({ userId, invoiceId, payerEmail, amount });

      expect(result).toEqual({
        success: false,
        message: 'Customer does not exist',
      });
    });

    it('should return an error if invoice does not exist', async () => {
      (paySchema.validate as jest.Mock).mockReturnValue({});

      (hashArguments as jest.Mock).mockReturnValue(faker.lorem.sentence());

      (isDuplicateTxn as jest.Mock).mockResolvedValue(false);

      (findUser as jest.Mock).mockResolvedValue({});

      (getBusinessAccountWithCustomer as jest.Mock).mockResolvedValue(businessAccWithCustomer);

      (findInvoice as jest.Mock).mockResolvedValue(null);

      const result = await TransactionController.paymentInit({ userId, invoiceId, payerEmail, amount });

      expect(result).toEqual({
        success: false,
        message: 'Invoice does not exist',
      });
    });

    it('should return an error if invoice has been paid for', async () => {
      (paySchema.validate as jest.Mock).mockReturnValue({});

      (hashArguments as jest.Mock).mockReturnValue(faker.lorem.sentence());

      (isDuplicateTxn as jest.Mock).mockResolvedValue(false);

      (findUser as jest.Mock).mockResolvedValue({});

      (getBusinessAccountWithCustomer as jest.Mock).mockResolvedValue(businessAccWithCustomer);

      (findInvoice as jest.Mock).mockResolvedValue(paidInvoiceDetails);

      const result = await TransactionController.paymentInit({ userId, invoiceId, payerEmail, amount });

      expect(result).toEqual({
        success: false,
        message: 'Invoice already paid',
      });
    });

    it('should return a success message if payment is successful', async () => {
      (paySchema.validate as jest.Mock).mockReturnValue({});

      (hashArguments as jest.Mock).mockReturnValue(faker.lorem.sentence());

      (isDuplicateTxn as jest.Mock).mockResolvedValue(false);

      (findUser as jest.Mock).mockResolvedValue({});

      (getBusinessAccountWithCustomer as jest.Mock).mockResolvedValue(businessAccWithCustomer);

      (findInvoice as jest.Mock).mockResolvedValue(invoiceDetails);

      (initPay as jest.Mock).mockResolvedValue({ success: true, message: faker.lorem.sentence() });

      const result = await TransactionController.paymentInit({ userId, invoiceId, payerEmail, amount });

      expect(result).toEqual({
        success: true,
        message: 'Payment initialized',
        data: result.data,
      });
    });
  });

  describe('getTransactionHistory', () => {
    it('should return an error if transaction details are invalid', async () => {
      const error = new Error(faker.lorem.sentence());
      (transactionHistorySchema.validate as jest.Mock).mockReturnValue({ error });

      const result = await TransactionController.getTransactionHistory({ userId, page: 1 });

      expect(result).toEqual({
        success: false,
        message: error.message,
      });
    });

    it('should return a success message if transactions are fetched successfully', async () => {
      (transactionHistorySchema.validate as jest.Mock).mockReturnValue({});

      (findUser as jest.Mock).mockResolvedValue({});

      (getTransactions as jest.Mock).mockResolvedValue({});

      const result = await TransactionController.getTransactionHistory({ userId, page: 1 });

      expect(result).toEqual({
        success: true,
        message: 'Transactions fetched successfully',
        data: result.data,
      });
    });
  });
});
