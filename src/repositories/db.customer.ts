import { Prisma } from '@prisma/client';
import prisma from '../utils/db.server';

export const createCustomer = (data: Prisma.CustomerCreateInput) => {
  return prisma.customer.create({ data });
};

export const findCustomer = (email: Prisma.CustomerWhereUniqueInput) => {
  return prisma.customer.findUnique({ where: email });
};

export const updateCustomer = (email: Prisma.CustomerWhereUniqueInput, data: Prisma.CustomerUpdateInput) => {
  return prisma.customer.update({ where: email, data });
};

export const deleteCustomer = (email: Prisma.CustomerWhereUniqueInput) => {
  return prisma.customer.delete({ where: email });
};

export const getBusinessCustomers = (businessAccountId: number) => {
  return prisma.customer.findMany({ where: { businessAccountId } });
};
