"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const faker_1 = require("@faker-js/faker");
const db_user_1 = require("../repositories/db.user");
const redis_user_1 = require("../repositories/redis.user");
const passwordService_1 = require("../utils/passwordService");
const validators_1 = require("../utils/validators");
const email_1 = require("../services/email/email");
const Passwordcontroller_1 = __importDefault(require("./Passwordcontroller"));
jest.mock('../repositories/db.user');
jest.mock('../repositories/redis.user');
jest.mock('../utils/passwordService');
jest.mock('../services/email/email');
jest.mock('../repositories/db.account');
jest.mock('../utils/validators');
describe('PasswordController', () => {
    const userId = faker_1.faker.number.int();
    const user1 = {
        id: userId,
        password: faker_1.faker.internet.password(),
        email: faker_1.faker.internet.email(),
        firstName: faker_1.faker.person.firstName(),
        lastName: faker_1.faker.person.lastName(),
        phoneNumber: faker_1.faker.phone.number(),
        createdAt: faker_1.faker.date.past(),
    };
    describe('changePassword', () => {
        it('should return an error if password is invalid', async () => {
            const error = new Error(faker_1.faker.lorem.sentence());
            validators_1.changePasswordSchema.validate.mockReturnValue({ error });
            const result = await Passwordcontroller_1.default.changePassword({
                userId,
                currentPassword: faker_1.faker.internet.password(),
                newPassword: faker_1.faker.internet.password(),
            });
            expect(result).toEqual({
                success: false,
                error: error.message,
            });
        });
        it('should return an error if user does not exist', async () => {
            validators_1.changePasswordSchema.validate.mockReturnValue({ error: null });
            db_user_1.findUser.mockResolvedValue(undefined);
            const result = await Passwordcontroller_1.default.changePassword({
                userId,
                currentPassword: faker_1.faker.internet.password(),
                newPassword: faker_1.faker.internet.password(),
            });
            expect(result).toEqual({
                success: false,
                error: 'Could not change password',
            });
        });
        it('should return an error if current password is invalid', async () => {
            validators_1.changePasswordSchema.validate.mockReturnValue({ error: null });
            db_user_1.findUser.mockResolvedValue(user1);
            passwordService_1.comparePasswords.mockResolvedValue(false);
            const result = await Passwordcontroller_1.default.changePassword({
                userId,
                currentPassword: faker_1.faker.internet.password(),
                newPassword: faker_1.faker.internet.password(),
            });
            expect(result).toEqual({
                success: false,
                error: 'Current password is incorrect',
            });
        });
        it('should return an error if password could not be hashed', async () => {
            validators_1.changePasswordSchema.validate.mockReturnValue({ error: null });
            db_user_1.findUser.mockResolvedValue(user1);
            passwordService_1.comparePasswords.mockResolvedValue(true);
            passwordService_1.hashPassword.mockRejectedValue(new Error(faker_1.faker.lorem.sentence()));
            const result = await Passwordcontroller_1.default.changePassword({
                userId,
                currentPassword: faker_1.faker.internet.password(),
                newPassword: faker_1.faker.internet.password(),
            });
            expect(result).toEqual({
                success: false,
                error: 'Could not change password',
            });
        });
        it('should return an error if password could not be updated', async () => {
            validators_1.changePasswordSchema.validate.mockReturnValue({ error: null });
            db_user_1.findUser.mockResolvedValue(user1);
            passwordService_1.comparePasswords.mockResolvedValue(true);
            passwordService_1.hashPassword.mockResolvedValue(faker_1.faker.internet.password());
            db_user_1.updateUser.mockRejectedValue(new Error(faker_1.faker.lorem.sentence()));
            const result = await Passwordcontroller_1.default.changePassword({
                userId,
                currentPassword: faker_1.faker.internet.password(),
                newPassword: faker_1.faker.internet.password(),
            });
            expect(result).toEqual({
                success: false,
                error: 'Could not change password',
            });
        });
        it('should return a success message if password was changed successfully', async () => {
            validators_1.changePasswordSchema.validate.mockReturnValue({ error: null });
            db_user_1.findUser.mockResolvedValue(user1);
            passwordService_1.comparePasswords.mockResolvedValue(true);
            passwordService_1.hashPassword.mockResolvedValue(faker_1.faker.internet.password());
            db_user_1.updateUser.mockResolvedValue(undefined);
            const result = await Passwordcontroller_1.default.changePassword({
                userId,
                currentPassword: faker_1.faker.internet.password(),
                newPassword: faker_1.faker.internet.password(),
            });
            expect(result).toEqual({
                success: true,
                message: 'Password changed successfully',
            });
        });
    });
    describe('resetPassword', () => {
        it('should return an error if email is invalid', async () => {
            const error = new Error(faker_1.faker.lorem.sentence());
            validators_1.forgotPasswordSchema.validate.mockReturnValue({ error });
            const result = await Passwordcontroller_1.default.resetPassword(faker_1.faker.internet.email());
            expect(result).toEqual({
                success: false,
                error: error.message,
            });
        });
        it('should still return success even if user does not exist', async () => {
            validators_1.forgotPasswordSchema.validate.mockReturnValue({ error: null });
            db_user_1.findUser.mockResolvedValue(undefined);
            const result = await Passwordcontroller_1.default.resetPassword(faker_1.faker.internet.email());
            expect(result).toEqual({
                success: true,
                message: 'A 5-digit code has been sent to your email address to complete the password reset process',
            });
        });
        it('should return an error if token could not be stored', async () => {
            validators_1.forgotPasswordSchema.validate.mockReturnValue({ error: null });
            db_user_1.findUser.mockResolvedValue(user1);
            redis_user_1.storeResetToken.mockRejectedValue(new Error(faker_1.faker.lorem.sentence()));
            const result = await Passwordcontroller_1.default.resetPassword(faker_1.faker.internet.email());
            expect(result).toEqual({
                success: false,
                error: 'Could not cache the password reset token',
            });
        });
        it('should return a success message if email was sent successfully', async () => {
            validators_1.forgotPasswordSchema.validate.mockReturnValue({ error: null });
            db_user_1.findUser.mockResolvedValue(user1);
            redis_user_1.storeResetToken.mockResolvedValue(undefined);
            email_1.sendEmail.mockResolvedValue(undefined);
            const result = await Passwordcontroller_1.default.resetPassword(faker_1.faker.internet.email());
            expect(result).toEqual({
                success: true,
                message: 'A 5-digit code has been sent to your email address to complete the password reset process',
            });
        });
    });
    describe('confirmResetPassword', () => {
        it('should return an error if email is invalid', async () => {
            const email = faker_1.faker.internet.email();
            const code = faker_1.faker.number.int().toFixed(5);
            const newPassword = faker_1.faker.internet.password();
            const error = new Error(faker_1.faker.lorem.sentence());
            validators_1.resetPasswordSchema.validate.mockReturnValue({ error });
            const result = await Passwordcontroller_1.default.confirmResetPassword(email, code, newPassword);
            expect(result).toEqual({
                success: false,
                error: error.message,
            });
        });
        it('should return an error if code is invalid', async () => {
            const email = faker_1.faker.internet.email();
            const code = faker_1.faker.number.int().toFixed(7);
            const newPassword = faker_1.faker.internet.password();
            validators_1.resetPasswordSchema.validate.mockReturnValue({ error: null });
            db_user_1.findUser.mockResolvedValue(user1);
            redis_user_1.getResetToken.mockResolvedValue(undefined);
            const result = await Passwordcontroller_1.default.confirmResetPassword(email, code, newPassword);
            expect(result).toEqual({
                success: false,
                error: 'The code is invalid or has expired',
            });
        });
        it('should return an error if code is incorrect', async () => {
            const email = faker_1.faker.internet.email();
            const code = faker_1.faker.number.int().toFixed(5);
            const newPassword = faker_1.faker.internet.password();
            validators_1.resetPasswordSchema.validate.mockReturnValue({ error: null });
            db_user_1.findUser.mockResolvedValue(user1);
            redis_user_1.getResetToken.mockResolvedValue(faker_1.faker.number.int().toFixed(5));
            const result = await Passwordcontroller_1.default.confirmResetPassword(email, code, newPassword);
            expect(result).toEqual({
                success: false,
                error: 'The code is invalid or has expired',
            });
        });
        it('should return an error if user does not exist', async () => {
            const email = faker_1.faker.internet.email();
            const code = faker_1.faker.number.int().toFixed(5);
            const newPassword = faker_1.faker.internet.password();
            validators_1.resetPasswordSchema.validate.mockReturnValue({ error: null });
            db_user_1.findUser.mockResolvedValue(undefined);
            const result = await Passwordcontroller_1.default.confirmResetPassword(email, code, newPassword);
            expect(result).toEqual({
                success: false,
                error: 'User does not exist',
            });
        });
        it('should return an error if the new password matches the old password', async () => {
            const email = faker_1.faker.internet.email();
            const code = faker_1.faker.number.int().toFixed(5);
            const newPassword = user1.password;
            validators_1.resetPasswordSchema.validate.mockReturnValue({ error: null });
            db_user_1.findUser.mockResolvedValue(user1);
            passwordService_1.comparePasswords.mockResolvedValue(true);
            const result = await Passwordcontroller_1.default.confirmResetPassword(email, code, newPassword);
            expect(result).toEqual({
                success: false,
                error: 'New password cannot be the same as the current password',
            });
        });
        it('should return a success message if password was reset successfully', async () => {
            const email = faker_1.faker.internet.email();
            const code = faker_1.faker.number.int().toFixed(5);
            const newPassword = faker_1.faker.internet.password();
            validators_1.resetPasswordSchema.validate.mockReturnValue({ error: null });
            db_user_1.findUser.mockResolvedValue(user1);
            redis_user_1.getResetToken.mockResolvedValue(code);
            passwordService_1.hashPassword.mockResolvedValue(faker_1.faker.internet.password());
            db_user_1.updateUser.mockResolvedValue(undefined);
            const result = await Passwordcontroller_1.default.confirmResetPassword(email, code, newPassword);
            expect(result).toEqual({
                success: true,
                message: 'Password reset successful',
            });
        });
    });
});
//# sourceMappingURL=Passwordcontroller.spec.js.map