"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const faker_1 = require("@faker-js/faker");
const passwordService_1 = require("../utils/passwordService");
const validators_1 = require("../utils/validators");
const db_user_1 = require("../repositories/db.user");
const email_1 = require("../services/email/email");
const db_account_1 = require("../repositories/db.account");
const Authcontroller_1 = __importDefault(require("./Authcontroller"));
jest.mock('../utils/passwordService');
jest.mock('../utils/validators');
jest.mock('../repositories/db.user');
jest.mock('../services/email/email');
jest.mock('../repositories/db.account');
// mocked jwt sign with user id
jest.mock('jsonwebtoken', () => ({
    sign: jest.fn().mockImplementation((payload) => `token-${payload.id}`),
}));
describe('AuthController', () => {
    const user1 = {
        id: faker_1.faker.number.int(),
        firstName: faker_1.faker.person.firstName(),
        lastName: faker_1.faker.person.lastName(),
        businessName: faker_1.faker.company.name(),
        phoneNumber: faker_1.faker.phone.number(),
        email: faker_1.faker.internet.email(),
        password: faker_1.faker.internet.password(),
    };
    describe('register', () => {
        const registerArgs = {
            firstName: user1.firstName,
            lastName: user1.lastName,
            businessName: user1.businessName,
            phoneNumber: user1.phoneNumber,
            email: 'user1.email',
            password: user1.password,
        };
        it('should return an error if the user input is invalid', async () => {
            const error = new Error(faker_1.faker.lorem.sentence());
            validators_1.registerSchema.validate.mockReturnValue({ error });
            const result = await Authcontroller_1.default.register(registerArgs);
            expect(result).toEqual({
                success: false,
                error: error.message,
            });
        });
        it('should return an error if the user already exists', async () => {
            validators_1.registerSchema.validate.mockReturnValue({});
            db_user_1.findUserByEmailOrPhone.mockResolvedValue(user1);
            const result = await Authcontroller_1.default.register(registerArgs);
            expect(result).toEqual({
                success: false,
                error: 'User with same email or phoneNumber already exists',
            });
        });
        it('should return an error if the business already exists', async () => {
            validators_1.registerSchema.validate.mockReturnValue({});
            db_user_1.findUserByEmailOrPhone.mockResolvedValue(null);
            db_account_1.findbusinessAccount.mockResolvedValue(user1);
            const result = await Authcontroller_1.default.register(registerArgs);
            expect(result).toEqual({
                success: false,
                error: 'Business with same name already exists',
            });
        });
        it('should create a user and business account', async () => {
            validators_1.registerSchema.validate.mockReturnValue({});
            db_user_1.findUserByEmailOrPhone.mockResolvedValue(null);
            db_account_1.findbusinessAccount.mockResolvedValue(null);
            passwordService_1.hashPassword.mockResolvedValue(user1.password);
            db_user_1.createUser.mockResolvedValue(user1);
            email_1.sendEmail.mockResolvedValue(null);
            jsonwebtoken_1.default.sign.mockReturnValue(`token-${user1.id}`);
            await expect(Authcontroller_1.default.register(registerArgs)).resolves.toEqual({
                success: true,
                message: 'User registered successfully',
                token: `token-${user1.id}`,
            });
        });
    });
    describe('login', () => {
        const loginArgs = {
            email: user1.email,
            password: user1.password,
        };
        it('should return an error if the user input is invalid', async () => {
            const error = new Error(faker_1.faker.lorem.sentence());
            validators_1.loginSchema.validate.mockReturnValue({ error });
            const result = await Authcontroller_1.default.login(loginArgs);
            expect(result).toEqual({
                success: false,
                error: error.message,
            });
        });
        it('should return an error if the user does not exist', async () => {
            validators_1.loginSchema.validate.mockReturnValue({});
            db_user_1.findUser.mockResolvedValue(null);
            const result = await Authcontroller_1.default.login(loginArgs);
            expect(result).toEqual({
                success: false,
                error: 'Email/password mismatch',
            });
        });
        it('should return an error if the password is incorrect', async () => {
            validators_1.loginSchema.validate.mockReturnValue({});
            db_user_1.findUser.mockResolvedValue(user1);
            passwordService_1.comparePasswords.mockResolvedValue(false);
            const result = await Authcontroller_1.default.login(loginArgs);
            expect(result).toEqual({
                success: false,
                error: 'Email/password mismatch',
            });
        });
        it('should return a token if the password is correct', async () => {
            validators_1.loginSchema.validate.mockReturnValue({});
            db_user_1.findUser.mockResolvedValue(user1);
            passwordService_1.comparePasswords.mockResolvedValue(true);
            jsonwebtoken_1.default.sign.mockReturnValue(`token-${user1.id}`);
            const result = await Authcontroller_1.default.login(loginArgs);
            expect(result).toEqual({
                success: true,
                message: 'User logged in successfully',
                token: `token-${user1.id}`,
            });
        });
    });
});
//# sourceMappingURL=Authcontroller.spec.js.map