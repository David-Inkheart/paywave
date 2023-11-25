import { Prisma } from '@prisma/client';
import prisma from '../utils/db.server';

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
