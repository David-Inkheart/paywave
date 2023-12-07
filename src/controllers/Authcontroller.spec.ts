import jwt from 'jsonwebtoken';
import { faker } from '@faker-js/faker';
import { hashPassword, comparePasswords } from '../utils/passwordService';
import { registerSchema, loginSchema } from '../utils/validators';
import { createUser, findUser, findUserByEmailOrPhone } from '../repositories/db.user';
import { sendEmail } from '../services/email/email';
import { findbusinessAccount } from '../repositories/db.account';

import AuthController from './Authcontroller';

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
    id: faker.number.int(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    businessName: faker.company.name(),
    phoneNumber: faker.phone.number(),
    email: faker.internet.email(),
    password: faker.internet.password(),
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
      const error = new Error(faker.lorem.sentence());
      (registerSchema.validate as jest.Mock).mockReturnValue({ error });

      const result = await AuthController.register(registerArgs);

      expect(result).toEqual({
        success: false,
        error: error.message,
      });
    });

    it('should return an error if the user already exists', async () => {
      (registerSchema.validate as jest.Mock).mockReturnValue({});

      (findUserByEmailOrPhone as jest.Mock).mockResolvedValue(user1);

      const result = await AuthController.register(registerArgs);

      expect(result).toEqual({
        success: false,
        error: 'User with same email or phoneNumber already exists',
      });
    });

    it('should return an error if the business already exists', async () => {
      (registerSchema.validate as jest.Mock).mockReturnValue({});

      (findUserByEmailOrPhone as jest.Mock).mockResolvedValue(null);

      (findbusinessAccount as jest.Mock).mockResolvedValue(user1);

      const result = await AuthController.register(registerArgs);

      expect(result).toEqual({
        success: false,
        error: 'Business with same name already exists',
      });
    });

    it('should create a user and business account', async () => {
      (registerSchema.validate as jest.Mock).mockReturnValue({});

      (findUserByEmailOrPhone as jest.Mock).mockResolvedValue(null);

      (findbusinessAccount as jest.Mock).mockResolvedValue(null);

      (hashPassword as jest.Mock).mockResolvedValue(user1.password);

      (createUser as jest.Mock).mockResolvedValue(user1);

      (sendEmail as jest.Mock).mockResolvedValue(null);

      (jwt.sign as jest.Mock).mockReturnValue(`token-${user1.id}`);

      await expect(AuthController.register(registerArgs)).resolves.toEqual({
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
      const error = new Error(faker.lorem.sentence());
      (loginSchema.validate as jest.Mock).mockReturnValue({ error });

      const result = await AuthController.login(loginArgs);

      expect(result).toEqual({
        success: false,
        error: error.message,
      });
    });

    it('should return an error if the user does not exist', async () => {
      (loginSchema.validate as jest.Mock).mockReturnValue({});

      (findUser as jest.Mock).mockResolvedValue(null);

      const result = await AuthController.login(loginArgs);

      expect(result).toEqual({
        success: false,
        error: 'Email/password mismatch',
      });
    });

    it('should return an error if the password is incorrect', async () => {
      (loginSchema.validate as jest.Mock).mockReturnValue({});

      (findUser as jest.Mock).mockResolvedValue(user1);

      (comparePasswords as jest.Mock).mockResolvedValue(false);

      const result = await AuthController.login(loginArgs);

      expect(result).toEqual({
        success: false,
        error: 'Email/password mismatch',
      });
    });

    it('should return a token if the password is correct', async () => {
      (loginSchema.validate as jest.Mock).mockReturnValue({});

      (findUser as jest.Mock).mockResolvedValue(user1);

      (comparePasswords as jest.Mock).mockResolvedValue(true);

      (jwt.sign as jest.Mock).mockReturnValue(`token-${user1.id}`);

      const result = await AuthController.login(loginArgs);

      expect(result).toEqual({
        success: true,
        message: 'User logged in successfully',
        token: `token-${user1.id}`,
      });
    });
  });
});
