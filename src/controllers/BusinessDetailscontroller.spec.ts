import { Country } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { Decimal } from '@prisma/client/runtime/library';
import { findbusinessAccount, updatebusinessAccount } from '../repositories/db.account';
import { findUser } from '../repositories/db.user';
import { businessDetailsSchema, idSchema, paymentDetailsSchema } from '../utils/validators';

import BusinessDetailsController from './BusinessDetailscontroller';

jest.mock('../repositories/db.account');
jest.mock('../repositories/db.user');
jest.mock('../utils/validators');

describe('BusinessDetailsController', () => {
  const user1 = {
    id: faker.number.int(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    businessName: faker.company.name(),
    phoneNumber: faker.phone.number(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  };

  const businessAccount1 = {
    id: faker.number.int(),
    userId: user1.id,
    businessName: user1.businessName,
    streetAddress: faker.location.streetAddress(),
    city: faker.location.city(),
    country: faker.location.country() as Country,
    accountName: faker.finance.accountName(),
    accountNumber: faker.finance.accountNumber(),
    bankCode: faker.finance.bic(),
    balance: faker.finance.amount() as unknown as Decimal,
    createdAt: faker.date.past(),
  };

  describe('getBusinessDetails', () => {
    it('should return an error if the user id is invalid', async () => {
      const error = new Error(faker.lorem.sentence());
      (idSchema.validate as jest.Mock).mockReturnValue({ error });

      const result = await BusinessDetailsController.getBusinessDetails(user1.id);

      expect(result).toEqual({
        success: false,
        error: error.message,
      });
    });

    it('should return an error if the user does not exist', async () => {
      (idSchema.validate as jest.Mock).mockReturnValue({});

      (findUser as jest.Mock).mockResolvedValue(null);

      const result = await BusinessDetailsController.getBusinessDetails(user1.id);

      expect(result).toEqual({
        success: false,
        error: 'business account does not exist',
      });
    });

    it('should return an error if the business account does not exist', async () => {
      (idSchema.validate as jest.Mock).mockReturnValue({});

      (findUser as jest.Mock).mockResolvedValue(user1);

      (findbusinessAccount as jest.Mock).mockResolvedValue(null);

      const result = await BusinessDetailsController.getBusinessDetails(user1.id);

      expect(result).toEqual({
        success: false,
        error: 'business account does not exist',
      });
    });

    it('should return the business details', async () => {
      (idSchema.validate as jest.Mock).mockReturnValue({});

      (findUser as jest.Mock).mockResolvedValue(user1);

      (findbusinessAccount as jest.Mock).mockResolvedValue(businessAccount1);

      const result = await BusinessDetailsController.getBusinessDetails(user1.id);

      expect(result).toEqual({
        success: true,
        data: {
          ...businessAccount1,
          email: user1.email,
          phoneNumber: user1.phoneNumber,
        },
      });
    });
  });

  describe('updateBusinessDetails', () => {
    const businessDetails = {
      businessName: faker.company.name(),
      streetAddress: faker.location.streetAddress(),
      city: faker.location.city(),
      country: faker.location.country() as Country,
    };

    it('should return an error if the user id is invalid', async () => {
      const error = new Error(faker.lorem.sentence());
      (idSchema.validate as jest.Mock).mockReturnValue({ error });

      const result = await BusinessDetailsController.updateBusinessDetails({ userId: user1.id, ...businessDetails });

      expect(result).toEqual({
        success: false,
        error: error.message,
      });
    });

    it('should return an error if the user does not exist', async () => {
      (idSchema.validate as jest.Mock).mockReturnValue({});

      (findUser as jest.Mock).mockResolvedValue(null);

      const result = await BusinessDetailsController.updateBusinessDetails({ userId: user1.id, ...businessDetails });

      expect(result).toEqual({
        success: false,
        error: 'business account does not exist',
      });
    });

    it('should return an error if the business account does not exist', async () => {
      (idSchema.validate as jest.Mock).mockReturnValue({});

      (findUser as jest.Mock).mockResolvedValue(user1);

      (findbusinessAccount as jest.Mock).mockResolvedValue(null);

      const result = await BusinessDetailsController.updateBusinessDetails({ userId: user1.id, ...businessDetails });

      expect(result).toEqual({
        success: false,
        error: 'business account does not exist',
      });
    });

    it('should return an error if the business details are invalid', async () => {
      (idSchema.validate as jest.Mock).mockReturnValue({});

      (findUser as jest.Mock).mockResolvedValue(user1);

      (findbusinessAccount as jest.Mock).mockResolvedValue(businessAccount1);

      const error = new Error(faker.lorem.sentence());
      (businessDetailsSchema.validate as jest.Mock).mockReturnValue({ error });

      const result = await BusinessDetailsController.updateBusinessDetails({ userId: user1.id, ...businessDetails });

      expect(result).toEqual({
        success: false,
        error: error.message,
      });
    });

    it('should return an error if the business name already exists', async () => {
      (idSchema.validate as jest.Mock).mockReturnValue({});

      (findUser as jest.Mock).mockResolvedValue(user1);

      (findbusinessAccount as jest.Mock).mockResolvedValue(businessAccount1);

      (businessDetailsSchema.validate as jest.Mock).mockReturnValue({});

      const result = await BusinessDetailsController.updateBusinessDetails({ userId: user1.id, ...businessDetails });

      expect(result).toEqual({
        success: false,
        error: 'business name already exists',
      });
    });

    it('should update the business details when business name does not exist', async () => {
      (idSchema.validate as jest.Mock).mockReturnValue({});
      (findUser as jest.Mock).mockResolvedValue(user1);
      (findbusinessAccount as jest.Mock).mockImplementation(async (args) => {
        if (args.businessName === businessDetails.businessName) {
          // Simulated case where the business name doesn't exist
          return null;
        }
        // Simulated case where a different business name exists
        return { ...businessAccount1, id: faker.number.int() };
      });
      (businessDetailsSchema.validate as jest.Mock).mockReturnValue({});

      // Mocking a successful update
      (updatebusinessAccount as jest.Mock).mockResolvedValue({
        ...businessAccount1,
      });

      const result = await BusinessDetailsController.updateBusinessDetails({
        userId: user1.id,
        ...businessDetails,
      });

      expect(result).toEqual({
        success: true,
        message: 'business details updated successfully',
      });
    });
  });

  describe('updatePaymentDetails', () => {
    const paymentDetails = {
      accountName: faker.finance.accountName(),
      accountNumber: faker.finance.accountNumber(),
      bankCode: faker.finance.bic(),
    };

    it('should return an error if the user id is invalid', async () => {
      const error = new Error(faker.lorem.sentence());
      (idSchema.validate as jest.Mock).mockReturnValue({ error });

      const result = await BusinessDetailsController.updatePaymentDetails({ userId: user1.id, ...paymentDetails });

      expect(result).toEqual({
        success: false,
        error: error.message,
      });
    });

    it('should return an error if the user does not exist', async () => {
      (idSchema.validate as jest.Mock).mockReturnValue({});

      (findUser as jest.Mock).mockResolvedValue(null);

      const result = await BusinessDetailsController.updatePaymentDetails({ userId: user1.id, ...paymentDetails });

      expect(result).toEqual({
        success: false,
        error: 'business account does not exist',
      });
    });

    it('should return an error if the business account does not exist', async () => {
      (idSchema.validate as jest.Mock).mockReturnValue({});

      (findUser as jest.Mock).mockResolvedValue(user1);

      (findbusinessAccount as jest.Mock).mockResolvedValue(null);

      const result = await BusinessDetailsController.updatePaymentDetails({ userId: user1.id, ...paymentDetails });

      expect(result).toEqual({
        success: false,
        error: 'business account does not exist',
      });
    });

    it('should return an error if the payment details are invalid', async () => {
      (idSchema.validate as jest.Mock).mockReturnValue({});

      (findUser as jest.Mock).mockResolvedValue(user1);

      (findbusinessAccount as jest.Mock).mockResolvedValue(businessAccount1);

      const error = new Error(faker.lorem.sentence());
      (paymentDetailsSchema.validate as jest.Mock).mockReturnValue({ error });

      const result = await BusinessDetailsController.updatePaymentDetails({ userId: user1.id, ...paymentDetails });

      expect(result).toEqual({
        success: false,
        error: error.message,
      });
    });

    it('should return an error if the account number already exists', async () => {
      (idSchema.validate as jest.Mock).mockReturnValue({});
      (findUser as jest.Mock).mockResolvedValue(user1);
      (findbusinessAccount as jest.Mock).mockResolvedValue(businessAccount1);
      (paymentDetailsSchema.validate as jest.Mock).mockReturnValue({});
      (updatebusinessAccount as jest.Mock).mockResolvedValue({
        ...businessAccount1,
      });

      const result = await BusinessDetailsController.updatePaymentDetails({ userId: user1.id, ...paymentDetails });

      expect(result).toEqual({
        success: false,
        error: 'account number already exists',
      });
    });

    it('should update the payment details when account number does not exist', async () => {
      (idSchema.validate as jest.Mock).mockReturnValue({});
      (findUser as jest.Mock).mockResolvedValue(user1);
      (findbusinessAccount as jest.Mock).mockImplementation(async (args) => {
        if (args.accountNumber === paymentDetails.accountNumber) {
          // Simulated case where the account number doesn't exist
          return null;
        }
        // Simulated case where a different account number exists
        return { ...businessAccount1, id: faker.number.int() };
      });
      (paymentDetailsSchema.validate as jest.Mock).mockReturnValue({});

      // Mocking a successful update
      (updatebusinessAccount as jest.Mock).mockResolvedValue({
        ...businessAccount1,
      });

      const result = await BusinessDetailsController.updatePaymentDetails({ userId: user1.id, ...paymentDetails });

      expect(result).toEqual({
        success: true,
        message: 'Payment details updated successfully',
      });
    });
  });
});
