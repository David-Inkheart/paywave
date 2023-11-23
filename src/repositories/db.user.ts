import { Prisma, PrismaClient } from '@prisma/client';
import prisma from '../utils/db.server';

export type PrismaTransaction = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

export const findUser = (data: Prisma.UserWhereUniqueInput) => {
  return prisma.user.findUnique({ where: data });
};

// create user with an account
export const createUser = (data: Prisma.UserCreateManyInput, businessName: string) => {
  return prisma.user.create({
    data: {
      ...data,
      businessAccounts: {
        create: {
          businessName,
        },
      },
    },
  });
};

export const updateUser = (id: number, data: Prisma.UserUpdateInput) => {
  return prisma.user.update({ where: { id }, data });
};
