"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const faker_1 = require("@faker-js/faker");
const db_account_1 = require("../repositories/db.account");
const db_user_1 = require("../repositories/db.user");
const validators_1 = require("../utils/validators");
const BusinessDetailscontroller_1 = __importDefault(require("./BusinessDetailscontroller"));
jest.mock('../repositories/db.account');
jest.mock('../repositories/db.user');
jest.mock('../utils/validators');
describe('BusinessDetailsController', () => {
    const user1 = {
        id: faker_1.faker.number.int(),
        firstName: faker_1.faker.person.firstName(),
        lastName: faker_1.faker.person.lastName(),
        businessName: faker_1.faker.company.name(),
        phoneNumber: faker_1.faker.phone.number(),
        email: faker_1.faker.internet.email(),
        password: faker_1.faker.internet.password(),
    };
    const businessAccount1 = {
        id: faker_1.faker.number.int(),
        userId: user1.id,
        businessName: user1.businessName,
        streetAddress: faker_1.faker.location.streetAddress(),
        city: faker_1.faker.location.city(),
        country: faker_1.faker.location.country(),
        accountName: faker_1.faker.finance.accountName(),
        accountNumber: faker_1.faker.finance.accountNumber(),
        bankCode: faker_1.faker.finance.bic(),
        balance: faker_1.faker.finance.amount(),
        createdAt: faker_1.faker.date.past(),
    };
    describe('getBusinessDetails', () => {
        it('should return an error if the user id is invalid', async () => {
            const error = new Error(faker_1.faker.lorem.sentence());
            validators_1.idSchema.validate.mockReturnValue({ error });
            const result = await BusinessDetailscontroller_1.default.getBusinessDetails(user1.id);
            expect(result).toEqual({
                success: false,
                error: error.message,
            });
        });
        it('should return an error if the user does not exist', async () => {
            validators_1.idSchema.validate.mockReturnValue({});
            db_user_1.findUser.mockResolvedValue(null);
            const result = await BusinessDetailscontroller_1.default.getBusinessDetails(user1.id);
            expect(result).toEqual({
                success: false,
                error: 'business account does not exist',
            });
        });
        it('should return an error if the business account does not exist', async () => {
            validators_1.idSchema.validate.mockReturnValue({});
            db_user_1.findUser.mockResolvedValue(user1);
            db_account_1.findbusinessAccount.mockResolvedValue(null);
            const result = await BusinessDetailscontroller_1.default.getBusinessDetails(user1.id);
            expect(result).toEqual({
                success: false,
                error: 'business account does not exist',
            });
        });
        it('should return the business details', async () => {
            validators_1.idSchema.validate.mockReturnValue({});
            db_user_1.findUser.mockResolvedValue(user1);
            db_account_1.findbusinessAccount.mockResolvedValue(businessAccount1);
            const result = await BusinessDetailscontroller_1.default.getBusinessDetails(user1.id);
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
            businessName: faker_1.faker.company.name(),
            streetAddress: faker_1.faker.location.streetAddress(),
            city: faker_1.faker.location.city(),
            country: faker_1.faker.location.country(),
        };
        it('should return an error if the user id is invalid', async () => {
            const error = new Error(faker_1.faker.lorem.sentence());
            validators_1.idSchema.validate.mockReturnValue({ error });
            const result = await BusinessDetailscontroller_1.default.updateBusinessDetails({ userId: user1.id, ...businessDetails });
            expect(result).toEqual({
                success: false,
                error: error.message,
            });
        });
        it('should return an error if the user does not exist', async () => {
            validators_1.idSchema.validate.mockReturnValue({});
            db_user_1.findUser.mockResolvedValue(null);
            const result = await BusinessDetailscontroller_1.default.updateBusinessDetails({ userId: user1.id, ...businessDetails });
            expect(result).toEqual({
                success: false,
                error: 'business account does not exist',
            });
        });
        it('should return an error if the business account does not exist', async () => {
            validators_1.idSchema.validate.mockReturnValue({});
            db_user_1.findUser.mockResolvedValue(user1);
            db_account_1.findbusinessAccount.mockResolvedValue(null);
            const result = await BusinessDetailscontroller_1.default.updateBusinessDetails({ userId: user1.id, ...businessDetails });
            expect(result).toEqual({
                success: false,
                error: 'business account does not exist',
            });
        });
        it('should return an error if the business details are invalid', async () => {
            validators_1.idSchema.validate.mockReturnValue({});
            db_user_1.findUser.mockResolvedValue(user1);
            db_account_1.findbusinessAccount.mockResolvedValue(businessAccount1);
            const error = new Error(faker_1.faker.lorem.sentence());
            validators_1.businessDetailsSchema.validate.mockReturnValue({ error });
            const result = await BusinessDetailscontroller_1.default.updateBusinessDetails({ userId: user1.id, ...businessDetails });
            expect(result).toEqual({
                success: false,
                error: error.message,
            });
        });
        it('should return an error if the business name already exists', async () => {
            validators_1.idSchema.validate.mockReturnValue({});
            db_user_1.findUser.mockResolvedValue(user1);
            db_account_1.findbusinessAccount.mockResolvedValue(businessAccount1);
            validators_1.businessDetailsSchema.validate.mockReturnValue({});
            const result = await BusinessDetailscontroller_1.default.updateBusinessDetails({ userId: user1.id, ...businessDetails });
            expect(result).toEqual({
                success: false,
                error: 'business name already exists',
            });
        });
        it('should update the business details when business name does not exist', async () => {
            validators_1.idSchema.validate.mockReturnValue({});
            db_user_1.findUser.mockResolvedValue(user1);
            db_account_1.findbusinessAccount.mockImplementation(async (args) => {
                if (args.businessName === businessDetails.businessName) {
                    // Simulated case where the business name doesn't exist
                    return null;
                }
                // Simulated case where a different business name exists
                return { ...businessAccount1, id: faker_1.faker.number.int() };
            });
            validators_1.businessDetailsSchema.validate.mockReturnValue({});
            // Mocking a successful update
            db_account_1.updatebusinessAccount.mockResolvedValue({
                ...businessAccount1,
            });
            const result = await BusinessDetailscontroller_1.default.updateBusinessDetails({
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
            accountName: faker_1.faker.finance.accountName(),
            accountNumber: faker_1.faker.finance.accountNumber(),
            bankCode: faker_1.faker.finance.bic(),
        };
        it('should return an error if the user id is invalid', async () => {
            const error = new Error(faker_1.faker.lorem.sentence());
            validators_1.idSchema.validate.mockReturnValue({ error });
            const result = await BusinessDetailscontroller_1.default.updatePaymentDetails({ userId: user1.id, ...paymentDetails });
            expect(result).toEqual({
                success: false,
                error: error.message,
            });
        });
        it('should return an error if the user does not exist', async () => {
            validators_1.idSchema.validate.mockReturnValue({});
            db_user_1.findUser.mockResolvedValue(null);
            const result = await BusinessDetailscontroller_1.default.updatePaymentDetails({ userId: user1.id, ...paymentDetails });
            expect(result).toEqual({
                success: false,
                error: 'business account does not exist',
            });
        });
        it('should return an error if the business account does not exist', async () => {
            validators_1.idSchema.validate.mockReturnValue({});
            db_user_1.findUser.mockResolvedValue(user1);
            db_account_1.findbusinessAccount.mockResolvedValue(null);
            const result = await BusinessDetailscontroller_1.default.updatePaymentDetails({ userId: user1.id, ...paymentDetails });
            expect(result).toEqual({
                success: false,
                error: 'business account does not exist',
            });
        });
        it('should return an error if the payment details are invalid', async () => {
            validators_1.idSchema.validate.mockReturnValue({});
            db_user_1.findUser.mockResolvedValue(user1);
            db_account_1.findbusinessAccount.mockResolvedValue(businessAccount1);
            const error = new Error(faker_1.faker.lorem.sentence());
            validators_1.paymentDetailsSchema.validate.mockReturnValue({ error });
            const result = await BusinessDetailscontroller_1.default.updatePaymentDetails({ userId: user1.id, ...paymentDetails });
            expect(result).toEqual({
                success: false,
                error: error.message,
            });
        });
        it('should return an error if the account number already exists', async () => {
            validators_1.idSchema.validate.mockReturnValue({});
            db_user_1.findUser.mockResolvedValue(user1);
            db_account_1.findbusinessAccount.mockResolvedValue(businessAccount1);
            validators_1.paymentDetailsSchema.validate.mockReturnValue({});
            db_account_1.updatebusinessAccount.mockResolvedValue({
                ...businessAccount1,
            });
            const result = await BusinessDetailscontroller_1.default.updatePaymentDetails({ userId: user1.id, ...paymentDetails });
            expect(result).toEqual({
                success: false,
                error: 'account number already exists',
            });
        });
        it('should update the payment details when account number does not exist', async () => {
            validators_1.idSchema.validate.mockReturnValue({});
            db_user_1.findUser.mockResolvedValue(user1);
            db_account_1.findbusinessAccount.mockImplementation(async (args) => {
                if (args.accountNumber === paymentDetails.accountNumber) {
                    // Simulated case where the account number doesn't exist
                    return null;
                }
                // Simulated case where a different account number exists
                return { ...businessAccount1, id: faker_1.faker.number.int() };
            });
            validators_1.paymentDetailsSchema.validate.mockReturnValue({});
            // Mocking a successful update
            db_account_1.updatebusinessAccount.mockResolvedValue({
                ...businessAccount1,
            });
            const result = await BusinessDetailscontroller_1.default.updatePaymentDetails({ userId: user1.id, ...paymentDetails });
            expect(result).toEqual({
                success: true,
                message: 'Payment details updated successfully',
            });
        });
    });
});
//# sourceMappingURL=BusinessDetailscontroller.spec.js.map