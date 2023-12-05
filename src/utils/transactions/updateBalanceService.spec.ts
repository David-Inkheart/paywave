// import { faker } from '@faker-js/faker';
// import { mocked } from 'jest-mock';
// import { creditbusinessAccount, findbusinessAccountbyUserId } from '../../repositories/db.account';
// import { findCustomer } from '../../repositories/db.customer';
// import { updateInvoice } from '../../repositories/db.invoice';
// import { recordTransaction } from '../../repositories/db.transactions';
// import { findUser } from '../../repositories/db.user';
// import { sendEmail } from '../../services/email/email';
// import prisma from '../db.server';
// import updateBalance from './updateBalanceService';

// jest.mock('../../repositories/db.account');
// jest.mock('../../repositories/db.customer');
// jest.mock('../../repositories/db.invoice');
// jest.mock('../../repositories/db.transactions');
// jest.mock('../../repositories/db.user');
// jest.mock('../../services/email/email');
// jest.mock('../db.server');

// const mockedCreditbusinessAccount = mocked(creditbusinessAccount);
// const mockedFindbusinessAccountbyUserId = mocked(findbusinessAccountbyUserId);
// const mockedFindCustomer = mocked(findCustomer);
// const mockedUpdateInvoice = mocked(updateInvoice);
// const mockedRecordTransaction = mocked(recordTransaction);
// const mockedFindUser = mocked(findUser);
// const mockedSendEmail = mocked(sendEmail);
// const mockedPrisma = mocked(prisma);

// describe('updateBalanceService', () => {
//   const event = {
//     data: {
//       customer: {
//         email: faker.internet.email(),
//       },
//       amount: faker.number.int(),
//       reference: faker.string.uuid(),
//       status: 'success',
//       metadata: {
//         payerDetails: `${faker.internet.email()}:1`,
//       },
//     },
//   };

//   it('should update balance', async () => {
//     const { email } = event.data.customer;
//     const { amount, reference, status, metadata } = event.data;
//     const payerDetails = metadata.payerDetails as string;
//     const [payerEmail, invoiceId] = payerDetails.split(':');

// // const user = mockedFindUser.mockResolvedValueOnce({ id: faker.number.int(), firstName: faker.person.firstName(), lastName: faker.person.lastName(), email, password: faker.internet.password(), phoneNumber: faker.phone.number(), createdAt: faker.date.past() });

//     const user = await expect(findUser({ email })).resolves.toEqual({ id: expect.any(Number), firstName: expect.any(String), lastName: expect.any(String), email, password: expect.any(String), phoneNumber: expect.any(String), createdAt: expect.any(Date) });

//     // mockedFindCustomer.mockResolvedValueOnce({ id: faker.number.int(), name: faker.person.firstName(), email: payerEmail, createdAt: faker.date.past(), updatedAt: faker.date.past() });
