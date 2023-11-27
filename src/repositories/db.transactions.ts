import { Prisma } from '@prisma/client';
import { startOfDay, endOfDay } from 'date-fns';
import prisma from '../utils/db.server';

interface RecordTransactionInput {
  customerId: number;
  invoiceId: number;
  amount: number;
  transactionType: 'card' | 'bankTransfer';
  reference: string;
  businessAccountId: number;
  metadata?: { [key: string]: string | number };
}

export const recordTransaction = async (
  { amount, transactionType, businessAccountId, invoiceId, customerId, reference, metadata }: RecordTransactionInput,
  txn?: Prisma.TransactionClient,
) => {
  const createData = {
    customerId,
    invoiceId,
    amount,
    transactionType,
    reference,
    businessAccountId,
    metadata,
  };

  return txn ? txn.transaction.create({ data: createData }) : prisma.transaction.create({ data: createData });
};

interface GetTransactionsInput {
  userId: number;
  limit?: number;
  page: number;
  from?: string;
  to?: string;
  transactionType?: 'card' | 'bankTransfer';
}

export const getTransactions = async ({ userId, limit = 10, page = 1, from, to, transactionType }: GetTransactionsInput) => {
  const businessAccount = await prisma.businessAccount.findFirst({ where: { userId } });

  const StartDate = from ? startOfDay(new Date(from)) : undefined;
  const EndDate = to ? endOfDay(new Date(to)) : undefined;

  const [totalRecords, transactions] = await prisma.$transaction([
    prisma.transaction.count({
      where: {
        businessAccountId: businessAccount!.id,
        createdAt: {
          ...(from && { gte: StartDate }),
          ...(to && { lte: EndDate }),
        },
        transactionType,
      },
    }),

    prisma.transaction.findMany({
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        businessAccountId: businessAccount!.id,
        createdAt: {
          ...(from && { gte: StartDate }),
          ...(to && { lte: EndDate }),
        },
        transactionType,
      },
    }),
  ]);

  return {
    totalRecords,
    transactions,
  };
};

export const findTransaction = async (data: Prisma.TransactionWhereInput) => {
  return prisma.transaction.findFirst({ where: data });
};
