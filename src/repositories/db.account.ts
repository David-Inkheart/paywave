import { BusinessAccount, Prisma } from '@prisma/client';
import prisma from '../utils/db.server';

export const findbusinessAccount = (data: Prisma.BusinessAccountWhereInput) => {
  return prisma.businessAccount.findFirst({ where: data });
};

export const findbusinessAccountbyUserId = (userId: number, txn?: Prisma.TransactionClient) => {
  return txn
    ? txn.$queryRaw<BusinessAccount[]>(Prisma.sql`SELECT * FROM "public"."businessAccount" WHERE "userId" = ${userId} FOR UPDATE;`)
    : prisma.$queryRaw<BusinessAccount[]>(Prisma.sql`SELECT * FROM "public"."businessAccount" WHERE "userId" = ${userId} FOR UPDATE;`);
};

export const debitbusinessAccount = ({
  amount,
  businessAccountId,
  txn,
}: {
  amount: number;
  businessAccountId: number;
  txn?: Prisma.TransactionClient;
}) =>
  txn
    ? txn.businessAccount.update({
        where: { id: businessAccountId },
        data: {
          balance: {
            decrement: amount,
          },
        },
        select: { balance: true },
      })
    : prisma.businessAccount.update({
        where: { id: businessAccountId },
        data: {
          balance: {
            decrement: amount,
          },
        },
        select: { balance: true },
      });

export const creditbusinessAccount = ({
  amount,
  businessAccountId,
  txn,
}: {
  businessAccountId: number;
  amount: number;
  txn?: Prisma.TransactionClient;
}) =>
  txn
    ? txn.businessAccount.update({
        where: { id: businessAccountId },
        data: {
          balance: {
            increment: amount,
          },
        },
        select: { balance: true },
      })
    : prisma.businessAccount.update({
        where: { id: businessAccountId },
        data: {
          balance: {
            increment: amount,
          },
        },
        select: { balance: true },
      });

// export const getSubType = (name: string) => prisma.transactionSubType.findFirst({ where: { name } });
