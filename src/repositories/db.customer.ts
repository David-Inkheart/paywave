import { Prisma } from '@prisma/client';
import prisma from '../utils/db.server';

export const createCustomer = (data: Prisma.CustomerCreateInput) => {
  return prisma.customer.create({ data });
};

export const findCustomer = (data: Prisma.CustomerWhereInput) => {
  return prisma.customer.findFirst({ where: data });
};

export const updateCustomer = (id: Prisma.CustomerWhereUniqueInput, data: Prisma.CustomerUpdateInput) => {
  return prisma.customer.update({
    where: id,
    data,
  });
};

export const deleteCustomer = (id: Prisma.CustomerWhereUniqueInput) => {
  return prisma.customer.delete({ where: id });
};

export const getBusinessCustomers = (businessAccountId: number) => {
  return prisma.customer.findMany({ where: { businessAccountId } });
};
