import { Prisma } from '@prisma/client';
import prisma from '../utils/db.server';

interface UpdateInvoiceInput {
  invoiceId: number;
  customerId: number;
  businessAccountId: number;
  totalAmount: number;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  reference: string;
  txn?: Prisma.TransactionClient;
}

export const createInvoice = ({
  businessAccountId,
  customerId,
  totalAmount,
  paymentDueDate,
  items,
}: {
  businessAccountId: number;
  customerId: number;
  totalAmount: number;
  paymentDueDate: Date;
  items: Prisma.ItemCreateWithoutInvoiceInput[];
}) => {
  return prisma.invoice.create({
    data: {
      businessAccountId,
      customerId,
      totalAmount,
      paymentDueDate,
      items: {
        createMany: {
          data: items.map((item) => ({
            ...item,
          })),
        },
      },
    },
  });
};

export const getInvoice = (id: number) => {
  return prisma.invoice.findUnique({
    where: { id },
    include: { items: true },
  });
};

export const findInvoice = (data: Prisma.InvoiceWhereInput) => {
  return prisma.invoice.findFirst({ where: data });
};

export const getAllInvoices = (businessAccountId: number) => {
  return prisma.invoice.findMany({
    where: { businessAccountId },
    include: { items: true },
  });
};

export const updateInvoice = async ({ customerId, invoiceId, businessAccountId, paymentStatus, reference, totalAmount, txn }: UpdateInvoiceInput) => {
  return txn
    ? txn.invoice.updateMany({
        where: {
          customerId,
          id: invoiceId,
          businessAccountId,
          totalAmount,
        },
        data: {
          paymentStatus,
          reference,
        },
      })
    : prisma.invoice.updateMany({
        where: {
          id: invoiceId,
          customerId,
          businessAccountId,
          reference,
          totalAmount,
        },
        data: {
          paymentStatus,
          reference,
        },
      });
};
