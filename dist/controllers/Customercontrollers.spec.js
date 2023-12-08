"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const faker_1 = require("@faker-js/faker");
const client_1 = require("@prisma/client");
const library_1 = require("@prisma/client/runtime/library");
const db_account_1 = require("../repositories/db.account");
const db_customer_1 = require("../repositories/db.customer");
const validators_1 = require("../utils/validators");
const Customercontrollers_1 = __importDefault(require("./Customercontrollers"));
// Mocking external dependencies
jest.mock('../repositories/db.account');
jest.mock('../repositories/db.customer');
jest.mock('../utils/validators');
describe('CustomerController', () => {
    const user1 = {
        id: faker_1.faker.number.int(),
        businessName: faker_1.faker.company.name(),
    };
    const customerArgs = {
        customerName: faker_1.faker.person.fullName(),
        customerEmail: faker_1.faker.internet.email(),
    };
    const businessAccount1 = {
        id: faker_1.faker.number.int(),
        userId: user1.id,
        businessName: user1.businessName,
        customers: [],
    };
    const businessAccount2 = {
        id: faker_1.faker.number.int(),
        userId: faker_1.faker.number.int(),
        businessName: faker_1.faker.company.name(),
        customers: [
            {
                id: faker_1.faker.number.int(),
                name: faker_1.faker.person.fullName(),
                email: faker_1.faker.internet.email(),
            },
        ],
    };
    describe('createCustomer', () => {
        it('should return an error if the user id is invalid', async () => {
            const error = new Error(faker_1.faker.lorem.sentence());
            validators_1.customerEmailSchema.validate.mockReturnValue({ error });
            const result = await Customercontrollers_1.default.createCustomer({
                userId: faker_1.faker.number.int(),
                customerName: faker_1.faker.person.fullName(),
                customerEmail: faker_1.faker.internet.email(),
            });
            expect(result).toEqual({
                success: false,
                error: error.message,
            });
        });
        it('should return an error if the business account does not exist', async () => {
            validators_1.customerEmailSchema.validate.mockReturnValue({});
            db_account_1.getBusinessAccountWithCustomer.mockResolvedValue(null);
            const result = await Customercontrollers_1.default.createCustomer({
                userId: user1.id,
                customerName: faker_1.faker.person.fullName(),
                customerEmail: faker_1.faker.internet.email(),
            });
            expect(result).toEqual({
                success: false,
                error: 'business account does not exist',
            });
        });
        it('should return an error if the customer details are invalid', async () => {
            const error = new Error(faker_1.faker.lorem.sentence());
            validators_1.customerEmailSchema.validate.mockReturnValue({ error });
            db_account_1.getBusinessAccountWithCustomer.mockResolvedValue(businessAccount1);
            const result = await Customercontrollers_1.default.createCustomer({
                userId: user1.id,
                customerName: faker_1.faker.person.fullName(),
                customerEmail: faker_1.faker.internet.email(),
            });
            expect(result).toEqual({
                success: false,
                error: error.message,
            });
        });
        it('should return an error if the customer already exists', async () => {
            validators_1.customerEmailSchema.validate.mockReturnValue({});
            db_account_1.getBusinessAccountWithCustomer.mockResolvedValue({
                ...businessAccount1,
                customers: [
                    {
                        id: faker_1.faker.number.int(),
                        name: customerArgs.customerName,
                        email: customerArgs.customerEmail,
                    },
                ],
            });
            const result = await Customercontrollers_1.default.createCustomer({
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
            validators_1.customerEmailSchema.validate.mockReturnValue({});
            db_account_1.getBusinessAccountWithCustomer.mockResolvedValue(businessAccount1);
            db_customer_1.createCustomer.mockResolvedValue({
                id: faker_1.faker.number.int(),
                ...customerArgs,
            });
            const result = await Customercontrollers_1.default.createCustomer({
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
            customerName: faker_1.faker.person.fullName(),
        };
        it('should return an error if the user id is invalid', async () => {
            const error = new Error(faker_1.faker.lorem.sentence());
            validators_1.customerDetailSchema.validate.mockReturnValue({ error });
            const result = await Customercontrollers_1.default.updateCustomer({
                userId: faker_1.faker.number.int(),
                customerName: faker_1.faker.person.fullName(),
                customerEmail: faker_1.faker.internet.email(),
            });
            expect(result).toEqual({
                success: false,
                error: error.message,
            });
        });
        it('should return an error if the business account does not exist', async () => {
            validators_1.customerDetailSchema.validate.mockReturnValue({});
            db_account_1.getBusinessAccountWithCustomer.mockResolvedValue(null);
            const result = await Customercontrollers_1.default.updateCustomer({
                userId: user1.id,
                customerName: faker_1.faker.person.fullName(),
                customerEmail: faker_1.faker.internet.email(),
            });
            expect(result).toEqual({
                success: false,
                error: 'business account does not exist',
            });
        });
        it('should return an error if the customer does not exist', async () => {
            validators_1.customerDetailSchema.validate.mockReturnValue({});
            db_account_1.getBusinessAccountWithCustomer.mockResolvedValue(businessAccount1);
            const result = await Customercontrollers_1.default.updateCustomer({
                userId: user1.id,
                customerName: faker_1.faker.person.fullName(),
                customerEmail: faker_1.faker.internet.email(),
            });
            expect(result).toEqual({
                success: false,
                error: 'Customer does not exist',
            });
        });
        it('should return an error if the customer details are invalid', async () => {
            const error = new Error(faker_1.faker.lorem.sentence());
            validators_1.customerDetailSchema.validate.mockReturnValue({ error });
            db_account_1.getBusinessAccountWithCustomer.mockResolvedValue(businessAccount1);
            const result = await Customercontrollers_1.default.updateCustomer({
                userId: user1.id,
                customerName: faker_1.faker.person.fullName(),
                customerEmail: faker_1.faker.internet.email(),
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
                        id: faker_1.faker.number.int(),
                        name: customerArgs.customerName,
                        email: customerArgs.customerEmail,
                    },
                ],
            };
            validators_1.customerDetailSchema.validate.mockReturnValue({});
            db_account_1.getBusinessAccountWithCustomer.mockResolvedValue(businessAccWithCustomer);
            const customer = businessAccWithCustomer.customers.find((cust) => cust.email === customerArgs.customerEmail);
            db_customer_1.updateCustomer.mockResolvedValue({
                id: customer.id,
                ...updatedCustomerArgs,
            });
            const result = await Customercontrollers_1.default.updateCustomer({
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
            const error = new Error(faker_1.faker.lorem.sentence());
            validators_1.customerDetailSchema.validate.mockReturnValue({ error });
            const result = await Customercontrollers_1.default.deleteCustomer({
                userId: faker_1.faker.number.int(),
                customerEmail: faker_1.faker.internet.email(),
            });
            expect(result).toEqual({
                success: false,
                error: error.message,
            });
        });
        it('should return an error if the business account does not exist', async () => {
            validators_1.customerDetailSchema.validate.mockReturnValue({});
            db_account_1.getBusinessAccountWithCustomer.mockResolvedValue(null);
            const result = await Customercontrollers_1.default.deleteCustomer({
                userId: user1.id,
                customerEmail: faker_1.faker.internet.email(),
            });
            expect(result).toEqual({
                success: false,
                error: 'business account does not exist',
            });
        });
        it('should return an error if the customer does not exist', async () => {
            validators_1.customerDetailSchema.validate.mockReturnValue({});
            db_account_1.getBusinessAccountWithCustomer.mockResolvedValue(businessAccount1);
            const result = await Customercontrollers_1.default.deleteCustomer({
                userId: user1.id,
                customerEmail: faker_1.faker.internet.email(),
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
                        id: faker_1.faker.number.int(),
                        name: customerArgs.customerName,
                        email: customerArgs.customerEmail,
                        country: client_1.Country.Nigeria,
                        balance: new library_1.Decimal(0),
                    },
                ],
            };
            validators_1.customerDetailSchema.validate.mockReturnValue({});
            db_account_1.getBusinessAccountWithCustomer.mockResolvedValue(businessAccWithCustomer);
            const customer = businessAccWithCustomer.customers.find((cust) => cust.email === customerArgs.customerEmail);
            db_customer_1.deleteCustomer.mockResolvedValue({
                id: customer.id,
            });
            const result = await Customercontrollers_1.default.deleteCustomer({
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
            const error = new Error(faker_1.faker.lorem.sentence());
            validators_1.customerEmailSchema.validate.mockReturnValue({ error });
            const result = await Customercontrollers_1.default.getCustomer({
                userId: faker_1.faker.number.int(),
                customerEmail: faker_1.faker.internet.email(),
            });
            expect(result).toEqual({
                success: false,
                error: error.message,
            });
        });
        it('should return an error if the business account does not exist', async () => {
            validators_1.customerEmailSchema.validate.mockReturnValue({});
            db_account_1.getBusinessAccountWithCustomer.mockResolvedValue(null);
            const result = await Customercontrollers_1.default.getCustomer({
                userId: user1.id,
                customerEmail: faker_1.faker.internet.email(),
            });
            expect(result).toEqual({
                success: false,
                error: 'business account does not exist',
            });
        });
        it('should return an error if the customer does not exist', async () => {
            validators_1.customerEmailSchema.validate.mockReturnValue({});
            db_account_1.getBusinessAccountWithCustomer.mockResolvedValue(businessAccount1);
            const result = await Customercontrollers_1.default.getCustomer({
                userId: user1.id,
                customerEmail: faker_1.faker.internet.email(),
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
                        id: faker_1.faker.number.int(),
                        name: customerArgs.customerName,
                        email: customerArgs.customerEmail,
                        country: client_1.Country.Nigeria,
                        balance: new library_1.Decimal(0),
                    },
                ],
            };
            validators_1.customerEmailSchema.validate.mockReturnValue({});
            db_account_1.getBusinessAccountWithCustomer.mockResolvedValue(businessAccWithCustomer);
            const customer = businessAccWithCustomer.customers.find((cust) => cust.email === customerArgs.customerEmail);
            const result = await Customercontrollers_1.default.getCustomer({
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
            validators_1.customerEmailSchema.validate.mockReturnValue({});
            db_account_1.getBusinessAccountWithCustomer.mockResolvedValue(null);
            const result = await Customercontrollers_1.default.getCustomers(user1.id);
            expect(result).toEqual({
                success: false,
                error: 'business account does not exist',
            });
        });
        it('should return the customer details', async () => {
            validators_1.customerEmailSchema.validate.mockReturnValue({});
            db_account_1.getBusinessAccountWithCustomer.mockResolvedValue(businessAccount2);
            const result = await Customercontrollers_1.default.getCustomers(user1.id);
            expect(result).toEqual({
                success: true,
                data: businessAccount2.customers,
            });
        });
        it('should throw an error if could not get customers', async () => {
            validators_1.customerEmailSchema.validate.mockReturnValue({});
            db_account_1.getBusinessAccountWithCustomer.mockRejectedValue(new Error(faker_1.faker.lorem.sentence()));
            const result = await Customercontrollers_1.default.getCustomers(user1.id);
            expect(result).toEqual({
                success: false,
                error: 'Could not fetch customers',
            });
        });
    });
});
//# sourceMappingURL=Customercontrollers.spec.js.map