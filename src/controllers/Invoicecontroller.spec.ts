import { Item } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { Decimal } from '@prisma/client/runtime/library';
import { findbusinessAccount, getBusinessAccountWithCustomer } from '../repositories/db.account';
import { createInvoiceSchema, invoiceIdSchema } from '../utils/validators';
import { createInvoice, getAllInvoices, getInvoice } from '../repositories/db.invoice';
import hashArguments from '../utils/hash';
import isDuplicateTxn from '../utils/transactions/checkTransaction';
import { sendEmail } from '../services/email/email';
import { findCustomer } from '../repositories/db.customer';

import InvoiceController from './Invoicecontroller';

jest.mock('../repositories/db.account');
jest.mock('../repositories/db.invoice');
jest.mock('../repositories/db.customer');
jest.mock('../utils/transactions/checkTransaction');
jest.mock('../services/email/email');
jest.mock('../utils/hash');
jest.mock('../utils/validators');

describe('Invoice Controller', () => {
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

  describe('createPaymentInvoice', () => {
    const customerDetails = {
      id: 1,
      name: faker.person.fullName(),
      email: faker.internet.email(),
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
      reference: faker.string.uuid(),
    };

    it('should return an error if passed arguments are not valid', async () => {
      const error = new Error(faker.lorem.sentence());
      (createInvoiceSchema.validate as jest.Mock).mockReturnValueOnce({ error });

      const result = await InvoiceController.createPaymentInvoice({
        userId: faker.number.int(),
        customerId: faker.number.int(),
        items,
      });

      expect(result).toEqual({
        success: false,
        error: error.message,
      });
    });

    it('should return an error if the business account does not exist', async () => {
      (createInvoiceSchema.validate as jest.Mock).mockReturnValueOnce({ error: null });
      (getBusinessAccountWithCustomer as jest.Mock).mockResolvedValueOnce(null);

      const result = await InvoiceController.createPaymentInvoice({
        userId: faker.number.int(),
        customerId: faker.number.int(),
        items,
      });

      expect(result).toEqual({
        success: false,
        error: 'business account does not exist',
      });
    });

    it('should return an error if the customer does not exist', async () => {
      (createInvoiceSchema.validate as jest.Mock).mockReturnValueOnce({ error: null });
      (getBusinessAccountWithCustomer as jest.Mock).mockResolvedValueOnce(businessAccount);
      (findCustomer as jest.Mock).mockResolvedValueOnce(null);

      const result = await InvoiceController.createPaymentInvoice({
        userId: faker.number.int(),
        customerId: faker.number.int(),
        items,
      });

      expect(result).toEqual({
        success: false,
        error: 'Customer does not exist',
      });
    });

    it('should return an error if the invoice already exists', async () => {
      (createInvoiceSchema.validate as jest.Mock).mockReturnValueOnce({ error: null });

      (getBusinessAccountWithCustomer as jest.Mock).mockResolvedValueOnce(businessAccWithCustomer);

      (findCustomer as jest.Mock).mockResolvedValueOnce(customerDetails);

      (hashArguments as jest.Mock).mockReturnValueOnce('unique-hash');

      (isDuplicateTxn as jest.Mock).mockImplementationOnce(async () => true);

      (createInvoice as jest.Mock).mockResolvedValueOnce(invoiceDetails);

      (sendEmail as jest.Mock).mockResolvedValueOnce(true);

      const result = await InvoiceController.createPaymentInvoice({
        userId: faker.number.int(),
        customerId: customerDetails.id,
        items,
      });

      expect(result).toEqual({
        success: false,
        error: 'Invoice already exists',
      });
    });

    it('should create an invoice and send an email to the customer', async () => {
      (createInvoiceSchema.validate as jest.Mock).mockReturnValueOnce({ error: null });

      (getBusinessAccountWithCustomer as jest.Mock).mockResolvedValueOnce(businessAccWithCustomer);

      (findCustomer as jest.Mock).mockResolvedValueOnce(customerDetails);

      (hashArguments as jest.Mock).mockReturnValueOnce('unique-hash');

      (isDuplicateTxn as jest.Mock).mockImplementationOnce(async () => false);

      (createInvoice as jest.Mock).mockResolvedValueOnce(invoiceDetails);

      (sendEmail as jest.Mock).mockResolvedValueOnce(true);

      const result = await InvoiceController.createPaymentInvoice({
        userId: faker.number.int(),
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
      const error = new Error(faker.lorem.sentence());
      (invoiceIdSchema.validate as jest.Mock).mockReturnValueOnce({ error });

      const result = await InvoiceController.getPaymentInvoice({
        userId: faker.number.int(),
        invoiceId: faker.number.int(),
      });

      expect(result).toEqual({
        success: false,
        error: error.message,
      });
    });

    it('should return an error if business account does not exist', async () => {
      (invoiceIdSchema.validate as jest.Mock).mockReturnValueOnce({ error: null });
      (findbusinessAccount as jest.Mock).mockResolvedValueOnce(null);

      const result = await InvoiceController.getPaymentInvoice({
        userId: faker.number.int(),
        invoiceId: faker.number.int(),
      });

      expect(result).toEqual({
        success: false,
        error: 'business account does not exist',
      });
    });

    it('should return an error if invoice does not exist', async () => {
      (invoiceIdSchema.validate as jest.Mock).mockReturnValueOnce({ error: null });
      (findbusinessAccount as jest.Mock).mockResolvedValueOnce(businessAccount);
      (getInvoice as jest.Mock).mockResolvedValueOnce(null);

      const result = await InvoiceController.getPaymentInvoice({
        userId: faker.number.int(),
        invoiceId: faker.number.int(),
      });

      expect(result).toEqual({
        success: false,
        error: 'Invoice does not exist',
      });
    });

    it('should return invoice details', async () => {
      (invoiceIdSchema.validate as jest.Mock).mockReturnValueOnce({ error: null });
      (findbusinessAccount as jest.Mock).mockResolvedValueOnce(businessAccount);
      (getInvoice as jest.Mock).mockResolvedValueOnce(invoice);
      (findCustomer as jest.Mock).mockResolvedValueOnce({
        id: faker.number.int(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
      });

      const result = await InvoiceController.getPaymentInvoice({
        userId: faker.number.int(),
        invoiceId: faker.number.int(),
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
      (invoiceIdSchema.validate as jest.Mock).mockReturnValueOnce({ error: null });
      (findbusinessAccount as jest.Mock).mockResolvedValueOnce(businessAccount);
      (getInvoice as jest.Mock).mockRejectedValueOnce(new Error('Error retrieving invoice'));

      const result = await InvoiceController.getPaymentInvoice({
        userId: faker.number.int(),
        invoiceId: faker.number.int(),
      });

      expect(result).toEqual({
        success: false,
        error: 'Could not get invoice, please try again later',
      });
    });
  });

  describe('getAllPaymentInvoices', () => {
    it('should return an error if business account does not exist', async () => {
      (findbusinessAccount as jest.Mock).mockResolvedValueOnce(null);

      const result = await InvoiceController.getAllPaymentInvoices({
        userId: faker.number.int(),
      });

      expect(result).toEqual({
        success: false,
        error: 'business account does not exist',
      });
    });

    it('should return invoices', async () => {
      (findbusinessAccount as jest.Mock).mockResolvedValueOnce(businessAccount);
      (getAllInvoices as jest.Mock).mockResolvedValueOnce([invoice]);

      const result = await InvoiceController.getAllPaymentInvoices({
        userId: faker.number.int(),
      });

      expect(result).toEqual({
        success: true,
        data: [expect.objectContaining(invoice)],
      });
    });

    it('should handle errors during invoice retrieval', async () => {
      (findbusinessAccount as jest.Mock).mockResolvedValueOnce(businessAccount);
      (getAllInvoices as jest.Mock).mockRejectedValueOnce(new Error('Error retrieving invoices'));

      const result = await InvoiceController.getAllPaymentInvoices({
        userId: faker.number.int(),
      });

      expect(result).toEqual({
        success: false,
        error: 'Could not get invoices, please try again later',
      });
    });
  });
});
