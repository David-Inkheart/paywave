import { faker } from '@faker-js/faker';
import { Country } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { getBusinessAccountWithCustomer } from '../repositories/db.account';
import { createCustomer, deleteCustomer, updateCustomer } from '../repositories/db.customer';
import { customerDetailSchema, customerEmailSchema } from '../utils/validators';
import CustomerController from './Customercontrollers';

// Mocking external dependencies
jest.mock('../repositories/db.account');
jest.mock('../repositories/db.customer');
jest.mock('../utils/validators');

describe('CustomerController', () => {
  const user1 = {
    id: faker.number.int(),
    businessName: faker.company.name(),
  };

  const customerArgs = {
    customerName: faker.person.fullName(),
    customerEmail: faker.internet.email(),
  };

  const businessAccount1 = {
    id: faker.number.int(),
    userId: user1.id,
    businessName: user1.businessName,
    customers: [],
  };

  const businessAccount2 = {
    id: faker.number.int(),
    userId: faker.number.int(),
    businessName: faker.company.name(),
    customers: [
      {
        id: faker.number.int(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
      },
    ],
  };

  describe('createCustomer', () => {
    it('should return an error if the user id is invalid', async () => {
      const error = new Error(faker.lorem.sentence());
      (customerEmailSchema.validate as jest.Mock).mockReturnValue({ error });

      const result = await CustomerController.createCustomer({
        userId: faker.number.int(),
        customerName: faker.person.fullName(),
        customerEmail: faker.internet.email(),
      });

      expect(result).toEqual({
        success: false,
        error: error.message,
      });
    });

    it('should return an error if the business account does not exist', async () => {
      (customerEmailSchema.validate as jest.Mock).mockReturnValue({});

      (getBusinessAccountWithCustomer as jest.Mock).mockResolvedValue(null);

      const result = await CustomerController.createCustomer({
        userId: user1.id,
        customerName: faker.person.fullName(),
        customerEmail: faker.internet.email(),
      });

      expect(result).toEqual({
        success: false,
        error: 'business account does not exist',
      });
    });

    it('should return an error if the customer details are invalid', async () => {
      const error = new Error(faker.lorem.sentence());
      (customerEmailSchema.validate as jest.Mock).mockReturnValue({ error });

      (getBusinessAccountWithCustomer as jest.Mock).mockResolvedValue(businessAccount1);

      const result = await CustomerController.createCustomer({
        userId: user1.id,
        customerName: faker.person.fullName(),
        customerEmail: faker.internet.email(),
      });

      expect(result).toEqual({
        success: false,
        error: error.message,
      });
    });

    it('should return an error if the customer already exists', async () => {
      (customerEmailSchema.validate as jest.Mock).mockReturnValue({});

      (getBusinessAccountWithCustomer as jest.Mock).mockResolvedValue({
        ...businessAccount1,
        customers: [
          {
            id: faker.number.int(),
            name: customerArgs.customerName,
            email: customerArgs.customerEmail,
          },
        ],
      });

      const result = await CustomerController.createCustomer({
        userId: user1.id,
        customerName: customerArgs.customerName,
        customerEmail: customerArgs.customerEmail,
      });

      expect(result).toEqual({
        success: false,
        error: 'Customer already exists',
      });
    });

    it('should create a new customer and update the business account', async () => {
      (customerEmailSchema.validate as jest.Mock).mockReturnValue({});

      (getBusinessAccountWithCustomer as jest.Mock).mockResolvedValue(businessAccount1);

      (createCustomer as jest.Mock).mockResolvedValue({
        id: faker.number.int(),
        ...customerArgs,
      });

      const result = await CustomerController.createCustomer({
        userId: user1.id,
        customerName: customerArgs.customerName,
        customerEmail: customerArgs.customerEmail,
      });

      expect(result).toEqual({
        success: true,
        message: 'Customer created successfully',
      });
    });
  });

  describe('updateCustomer', () => {
    const updatedCustomerArgs = {
      customerName: faker.person.fullName(),
    };

    it('should return an error if the user id is invalid', async () => {
      const error = new Error(faker.lorem.sentence());
      (customerDetailSchema.validate as jest.Mock).mockReturnValue({ error });

      const result = await CustomerController.updateCustomer({
        userId: faker.number.int(),
        customerName: faker.person.fullName(),
        customerEmail: faker.internet.email(),
      });

      expect(result).toEqual({
        success: false,
        error: error.message,
      });
    });

    it('should return an error if the business account does not exist', async () => {
      (customerDetailSchema.validate as jest.Mock).mockReturnValue({});

      (getBusinessAccountWithCustomer as jest.Mock).mockResolvedValue(null);

      const result = await CustomerController.updateCustomer({
        userId: user1.id,
        customerName: faker.person.fullName(),
        customerEmail: faker.internet.email(),
      });

      expect(result).toEqual({
        success: false,
        error: 'business account does not exist',
      });
    });

    it('should return an error if the customer does not exist', async () => {
      (customerDetailSchema.validate as jest.Mock).mockReturnValue({});

      (getBusinessAccountWithCustomer as jest.Mock).mockResolvedValue(businessAccount1);

      const result = await CustomerController.updateCustomer({
        userId: user1.id,
        customerName: faker.person.fullName(),
        customerEmail: faker.internet.email(),
      });

      expect(result).toEqual({
        success: false,
        error: 'Customer does not exist',
      });
    });

    it('should return an error if the customer details are invalid', async () => {
      const error = new Error(faker.lorem.sentence());
      (customerDetailSchema.validate as jest.Mock).mockReturnValue({ error });

      (getBusinessAccountWithCustomer as jest.Mock).mockResolvedValue(businessAccount1);

      const result = await CustomerController.updateCustomer({
        userId: user1.id,
        customerName: faker.person.fullName(),
        customerEmail: faker.internet.email(),
      });

      expect(result).toEqual({
        success: false,
        error: error.message,
      });
    });

    it('should update the customer details', async () => {
      const businessAccWithCustomer = {
        ...businessAccount1,
        customers: [
          {
            id: faker.number.int(),
            name: customerArgs.customerName,
            email: customerArgs.customerEmail,
          },
        ],
      };

      (customerDetailSchema.validate as jest.Mock).mockReturnValue({});

      (getBusinessAccountWithCustomer as jest.Mock).mockResolvedValue(businessAccWithCustomer);

      const customer = businessAccWithCustomer.customers.find((cust) => cust.email === customerArgs.customerEmail);

      (updateCustomer as jest.Mock).mockResolvedValue({
        id: customer!.id,
        ...updatedCustomerArgs,
      });

      const result = await CustomerController.updateCustomer({
        userId: user1.id,
        customerName: updatedCustomerArgs.customerName,
        customerEmail: customerArgs.customerEmail,
      });

      expect(result).toEqual({
        success: true,
        message: 'Customer details updated successfully',
      });
    });
  });

  describe('deleteCustomer', () => {
    it('should return an error if the user id is invalid', async () => {
      const error = new Error(faker.lorem.sentence());
      (customerDetailSchema.validate as jest.Mock).mockReturnValue({ error });

      const result = await CustomerController.deleteCustomer({
        userId: faker.number.int(),
        customerEmail: faker.internet.email(),
      });

      expect(result).toEqual({
        success: false,
        error: error.message,
      });
    });

    it('should return an error if the business account does not exist', async () => {
      (customerDetailSchema.validate as jest.Mock).mockReturnValue({});

      (getBusinessAccountWithCustomer as jest.Mock).mockResolvedValue(null);

      const result = await CustomerController.deleteCustomer({
        userId: user1.id,
        customerEmail: faker.internet.email(),
      });

      expect(result).toEqual({
        success: false,
        error: 'business account does not exist',
      });
    });

    it('should return an error if the customer does not exist', async () => {
      (customerDetailSchema.validate as jest.Mock).mockReturnValue({});

      (getBusinessAccountWithCustomer as jest.Mock).mockResolvedValue(businessAccount1);

      const result = await CustomerController.deleteCustomer({
        userId: user1.id,
        customerEmail: faker.internet.email(),
      });

      expect(result).toEqual({
        success: false,
        error: 'Customer does not exist',
      });
    });

    it('should delete the customer', async () => {
      const businessAccWithCustomer = {
        ...businessAccount1,
        customers: [
          {
            id: faker.number.int(),
            name: customerArgs.customerName,
            email: customerArgs.customerEmail,
            country: Country.Nigeria,
            balance: new Decimal(0),
          },
        ],
      };

      (customerDetailSchema.validate as jest.Mock).mockReturnValue({});

      (getBusinessAccountWithCustomer as jest.Mock).mockResolvedValue(businessAccWithCustomer);

      const customer = businessAccWithCustomer.customers.find((cust) => cust.email === customerArgs.customerEmail);

      (deleteCustomer as jest.Mock).mockResolvedValue({
        id: customer!.id,
      });

      const result = await CustomerController.deleteCustomer({
        userId: user1.id,
        customerEmail: customerArgs.customerEmail,
      });

      expect(result).toEqual({
        success: true,
        message: 'Customer deleted successfully',
      });
    });
  });

  describe('getCustomer', () => {
    it('should return an error if the user id is invalid', async () => {
      const error = new Error(faker.lorem.sentence());
      (customerEmailSchema.validate as jest.Mock).mockReturnValue({ error });

      const result = await CustomerController.getCustomer({
        userId: faker.number.int(),
        customerEmail: faker.internet.email(),
      });

      expect(result).toEqual({
        success: false,
        error: error.message,
      });
    });

    it('should return an error if the business account does not exist', async () => {
      (customerEmailSchema.validate as jest.Mock).mockReturnValue({});

      (getBusinessAccountWithCustomer as jest.Mock).mockResolvedValue(null);

      const result = await CustomerController.getCustomer({
        userId: user1.id,
        customerEmail: faker.internet.email(),
      });

      expect(result).toEqual({
        success: false,
        error: 'business account does not exist',
      });
    });

    it('should return an error if the customer does not exist', async () => {
      (customerEmailSchema.validate as jest.Mock).mockReturnValue({});

      (getBusinessAccountWithCustomer as jest.Mock).mockResolvedValue(businessAccount1);

      const result = await CustomerController.getCustomer({
        userId: user1.id,
        customerEmail: faker.internet.email(),
      });

      expect(result).toEqual({
        success: false,
        error: 'Customer does not exist',
      });
    });

    it('should return the customer details', async () => {
      const businessAccWithCustomer = {
        ...businessAccount1,
        customers: [
          {
            id: faker.number.int(),
            name: customerArgs.customerName,
            email: customerArgs.customerEmail,
            country: Country.Nigeria,
            balance: new Decimal(0),
          },
        ],
      };

      (customerEmailSchema.validate as jest.Mock).mockReturnValue({});

      (getBusinessAccountWithCustomer as jest.Mock).mockResolvedValue(businessAccWithCustomer);

      const customer = businessAccWithCustomer.customers.find((cust) => cust.email === customerArgs.customerEmail);

      const result = await CustomerController.getCustomer({
        userId: user1.id,
        customerEmail: customerArgs.customerEmail,
      });

      expect(result).toEqual({
        success: true,
        data: customer,
      });
    });
  });

  describe('getCustomers', () => {
    it('should return an error if the business account does not exist', async () => {
      (customerEmailSchema.validate as jest.Mock).mockReturnValue({});

      (getBusinessAccountWithCustomer as jest.Mock).mockResolvedValue(null);

      const result = await CustomerController.getCustomers(user1.id);

      expect(result).toEqual({
        success: false,
        error: 'business account does not exist',
      });
    });

    it('should return the customer details', async () => {
      (customerEmailSchema.validate as jest.Mock).mockReturnValue({});

      (getBusinessAccountWithCustomer as jest.Mock).mockResolvedValue(businessAccount2);

      const result = await CustomerController.getCustomers(user1.id);

      expect(result).toEqual({
        success: true,
        data: businessAccount2.customers,
      });
    });

    it('should throw an error if could not get customers', async () => {
      (customerEmailSchema.validate as jest.Mock).mockReturnValue({});

      (getBusinessAccountWithCustomer as jest.Mock).mockRejectedValue(new Error(faker.lorem.sentence()));

      const result = await CustomerController.getCustomers(user1.id);

      expect(result).toEqual({
        success: false,
        error: 'Could not fetch customers',
      });
    });
  });
});
