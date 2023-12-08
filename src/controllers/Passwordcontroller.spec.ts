import { faker } from '@faker-js/faker';
import { findUser, updateUser } from '../repositories/db.user';
import { getResetToken, storeResetToken } from '../repositories/redis.user';
import { hashPassword, comparePasswords } from '../utils/passwordService';
import { changePasswordSchema, forgotPasswordSchema, resetPasswordSchema } from '../utils/validators';
import { sendEmail } from '../services/email/email';

import PasswordController from './Passwordcontroller';

jest.mock('../repositories/db.user');
jest.mock('../repositories/redis.user');
jest.mock('../utils/passwordService');
jest.mock('../services/email/email');
jest.mock('../repositories/db.account');
jest.mock('../utils/validators');

describe('PasswordController', () => {
  const userId = faker.number.int();

  const user1 = {
    id: userId,
    password: faker.internet.password(),
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    phoneNumber: faker.phone.number(),
    createdAt: faker.date.past(),
  };

  describe('changePassword', () => {
    it('should return an error if password is invalid', async () => {
      const error = new Error(faker.lorem.sentence());
      (changePasswordSchema.validate as jest.Mock).mockReturnValue({ error });

      const result = await PasswordController.changePassword({
        userId,
        currentPassword: faker.internet.password(),
        newPassword: faker.internet.password(),
      });

      expect(result).toEqual({
        success: false,
        error: error.message,
      });
    });

    it('should return an error if user does not exist', async () => {
      (changePasswordSchema.validate as jest.Mock).mockReturnValue({ error: null });
      (findUser as jest.Mock).mockResolvedValue(undefined);

      const result = await PasswordController.changePassword({
        userId,
        currentPassword: faker.internet.password(),
        newPassword: faker.internet.password(),
      });

      expect(result).toEqual({
        success: false,
        error: 'Could not change password',
      });
    });

    it('should return an error if current password is invalid', async () => {
      (changePasswordSchema.validate as jest.Mock).mockReturnValue({ error: null });
      (findUser as jest.Mock).mockResolvedValue(user1);
      (comparePasswords as jest.Mock).mockResolvedValue(false);

      const result = await PasswordController.changePassword({
        userId,
        currentPassword: faker.internet.password(),
        newPassword: faker.internet.password(),
      });

      expect(result).toEqual({
        success: false,
        error: 'Current password is incorrect',
      });
    });

    it('should return an error if password could not be hashed', async () => {
      (changePasswordSchema.validate as jest.Mock).mockReturnValue({ error: null });
      (findUser as jest.Mock).mockResolvedValue(user1);
      (comparePasswords as jest.Mock).mockResolvedValue(true);
      (hashPassword as jest.Mock).mockRejectedValue(new Error(faker.lorem.sentence()));

      const result = await PasswordController.changePassword({
        userId,
        currentPassword: faker.internet.password(),
        newPassword: faker.internet.password(),
      });

      expect(result).toEqual({
        success: false,
        error: 'Could not change password',
      });
    });

    it('should return an error if password could not be updated', async () => {
      (changePasswordSchema.validate as jest.Mock).mockReturnValue({ error: null });
      (findUser as jest.Mock).mockResolvedValue(user1);
      (comparePasswords as jest.Mock).mockResolvedValue(true);
      (hashPassword as jest.Mock).mockResolvedValue(faker.internet.password());
      (updateUser as jest.Mock).mockRejectedValue(new Error(faker.lorem.sentence()));

      const result = await PasswordController.changePassword({
        userId,
        currentPassword: faker.internet.password(),
        newPassword: faker.internet.password(),
      });

      expect(result).toEqual({
        success: false,
        error: 'Could not change password',
      });
    });

    it('should return a success message if password was changed successfully', async () => {
      (changePasswordSchema.validate as jest.Mock).mockReturnValue({ error: null });
      (findUser as jest.Mock).mockResolvedValue(user1);
      (comparePasswords as jest.Mock).mockResolvedValue(true);
      (hashPassword as jest.Mock).mockResolvedValue(faker.internet.password());
      (updateUser as jest.Mock).mockResolvedValue(undefined);

      const result = await PasswordController.changePassword({
        userId,
        currentPassword: faker.internet.password(),
        newPassword: faker.internet.password(),
      });

      expect(result).toEqual({
        success: true,
        message: 'Password changed successfully',
      });
    });
  });

  describe('resetPassword', () => {
    it('should return an error if email is invalid', async () => {
      const error = new Error(faker.lorem.sentence());
      (forgotPasswordSchema.validate as jest.Mock).mockReturnValue({ error });

      const result = await PasswordController.resetPassword(faker.internet.email());

      expect(result).toEqual({
        success: false,
        error: error.message,
      });
    });

    it('should still return success even if user does not exist', async () => {
      (forgotPasswordSchema.validate as jest.Mock).mockReturnValue({ error: null });
      (findUser as jest.Mock).mockResolvedValue(undefined);

      const result = await PasswordController.resetPassword(faker.internet.email());

      expect(result).toEqual({
        success: true,
        message: 'A 5-digit code has been sent to your email address to complete the password reset process',
      });
    });

    it('should return an error if token could not be stored', async () => {
      (forgotPasswordSchema.validate as jest.Mock).mockReturnValue({ error: null });
      (findUser as jest.Mock).mockResolvedValue(user1);
      (storeResetToken as jest.Mock).mockRejectedValue(new Error(faker.lorem.sentence()));

      const result = await PasswordController.resetPassword(faker.internet.email());

      expect(result).toEqual({
        success: false,
        error: 'Could not cache the password reset token',
      });
    });

    it('should return a success message if email was sent successfully', async () => {
      (forgotPasswordSchema.validate as jest.Mock).mockReturnValue({ error: null });
      (findUser as jest.Mock).mockResolvedValue(user1);
      (storeResetToken as jest.Mock).mockResolvedValue(undefined);
      (sendEmail as jest.Mock).mockResolvedValue(undefined);

      const result = await PasswordController.resetPassword(faker.internet.email());

      expect(result).toEqual({
        success: true,
        message: 'A 5-digit code has been sent to your email address to complete the password reset process',
      });
    });
  });

  describe('confirmResetPassword', () => {
    it('should return an error if email is invalid', async () => {
      const email = faker.internet.email();
      const code = faker.number.int().toFixed(5);
      const newPassword = faker.internet.password();

      const error = new Error(faker.lorem.sentence());
      (resetPasswordSchema.validate as jest.Mock).mockReturnValue({ error });
      const result = await PasswordController.confirmResetPassword(email, code, newPassword);

      expect(result).toEqual({
        success: false,
        error: error.message,
      });
    });

    it('should return an error if code is invalid', async () => {
      const email = faker.internet.email();
      const code = faker.number.int().toFixed(7);
      const newPassword = faker.internet.password();

      (resetPasswordSchema.validate as jest.Mock).mockReturnValue({ error: null });
      (findUser as jest.Mock).mockResolvedValue(user1);
      (getResetToken as jest.Mock).mockResolvedValue(undefined);

      const result = await PasswordController.confirmResetPassword(email, code, newPassword);

      expect(result).toEqual({
        success: false,
        error: 'The code is invalid or has expired',
      });
    });

    it('should return an error if code is incorrect', async () => {
      const email = faker.internet.email();
      const code = faker.number.int().toFixed(5);
      const newPassword = faker.internet.password();

      (resetPasswordSchema.validate as jest.Mock).mockReturnValue({ error: null });
      (findUser as jest.Mock).mockResolvedValue(user1);
      (getResetToken as jest.Mock).mockResolvedValue(faker.number.int().toFixed(5));

      const result = await PasswordController.confirmResetPassword(email, code, newPassword);

      expect(result).toEqual({
        success: false,
        error: 'The code is invalid or has expired',
      });
    });

    it('should return an error if user does not exist', async () => {
      const email = faker.internet.email();
      const code = faker.number.int().toFixed(5);
      const newPassword = faker.internet.password();

      (resetPasswordSchema.validate as jest.Mock).mockReturnValue({ error: null });
      (findUser as jest.Mock).mockResolvedValue(undefined);

      const result = await PasswordController.confirmResetPassword(email, code, newPassword);

      expect(result).toEqual({
        success: false,
        error: 'User does not exist',
      });
    });

    it('should return an error if the new password matches the old password', async () => {
      const email = faker.internet.email();
      const code = faker.number.int().toFixed(5);
      const newPassword = user1.password;

      (resetPasswordSchema.validate as jest.Mock).mockReturnValue({ error: null });
      (findUser as jest.Mock).mockResolvedValue(user1);

      (comparePasswords as jest.Mock).mockResolvedValue(true);

      const result = await PasswordController.confirmResetPassword(email, code, newPassword);

      expect(result).toEqual({
        success: false,
        error: 'New password cannot be the same as the current password',
      });
    });

    it('should return a success message if password was reset successfully', async () => {
      const email = faker.internet.email();
      const code = faker.number.int().toFixed(5);
      const newPassword = faker.internet.password();

      (resetPasswordSchema.validate as jest.Mock).mockReturnValue({ error: null });
      (findUser as jest.Mock).mockResolvedValue(user1);
      (getResetToken as jest.Mock).mockResolvedValue(code);
      (hashPassword as jest.Mock).mockResolvedValue(faker.internet.password());
      (updateUser as jest.Mock).mockResolvedValue(undefined);

      const result = await PasswordController.confirmResetPassword(email, code, newPassword);

      expect(result).toEqual({
        success: true,
        message: 'Password reset successful',
      });
    });
  });
});
