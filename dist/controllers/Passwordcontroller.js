"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_user_1 = require("../repositories/db.user");
const redis_user_1 = require("../repositories/redis.user");
const passwordService_1 = require("../utils/passwordService");
const validators_1 = require("../utils/validators");
const email_1 = require("../services/email/email");
const db_account_1 = require("../repositories/db.account");
class PasswordController {
    static async changePassword({ userId, currentPassword, newPassword }) {
        try {
            const { error } = validators_1.changePasswordSchema.validate({ currentPassword, newPassword });
            if (error) {
                return {
                    success: false,
                    error: error.message,
                };
            }
            const existingUser = await (0, db_user_1.findUser)({ id: userId });
            // compare old password with the one in the database
            const isPasswordValid = await (0, passwordService_1.comparePasswords)(currentPassword, existingUser.password);
            if (!isPasswordValid) {
                return {
                    success: false,
                    error: 'Current password is incorrect',
                };
            }
            // hash the password
            const hashedPassword = await (0, passwordService_1.hashPassword)(newPassword);
            // update the user's password
            await (0, db_user_1.updateUser)(userId, { password: hashedPassword });
            return {
                success: true,
                message: 'Password changed successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Could not change password',
            };
        }
    }
    static async resetPassword(email) {
        // validate the user input
        const { error } = validators_1.forgotPasswordSchema.validate({ email });
        if (error) {
            return {
                success: false,
                error: error.message,
            };
        }
        // check if user already exists
        const existingUser = await (0, db_user_1.findUser)({ email });
        if (existingUser) {
            // generate a 5-digit code
            const passwordResetToken = Math.floor(10000 + Math.random() * 90000);
            // save the code to the Redis store with an expiration of 10 minutes
            const key = `password-reset-token-${existingUser.id}`;
            try {
                await (0, redis_user_1.storeResetToken)(key, passwordResetToken.toString());
            }
            catch (err) {
                return {
                    success: false,
                    error: 'Could not cache the password reset token',
                };
            }
            // get the user's business name
            const businessAccount = await (0, db_account_1.findbusinessAccount)({ userId: existingUser.id });
            // send the code to the user's email address
            await (0, email_1.sendEmail)({
                recipientEmail: existingUser.email,
                otp: passwordResetToken,
                purpose: 'reset',
                businessName: businessAccount.businessName,
            });
            console.log('Password reset code: ', passwordResetToken);
        }
        return {
            success: true,
            message: 'A 5-digit code has been sent to your email address to complete the password reset process',
        };
    }
    static async confirmResetPassword(email, code, newPassword) {
        // validate the user input
        const { error } = validators_1.resetPasswordSchema.validate({ email, code, newPassword });
        if (error) {
            return {
                success: false,
                error: error.message,
            };
        }
        // check if user already exists
        const existingUser = await (0, db_user_1.findUser)({ email });
        if (!existingUser) {
            return {
                success: false,
                error: 'User does not exist',
            };
        }
        // check if the newPassword is the same as the current password
        const isPasswordValid = await (0, passwordService_1.comparePasswords)(newPassword, existingUser.password);
        if (isPasswordValid) {
            return {
                success: false,
                error: 'New password cannot be the same as the current password',
            };
        }
        // check if the code is valid
        const key = `password-reset-token-${existingUser.id}`;
        const cachedCode = await (0, redis_user_1.getResetToken)(key);
        if (!cachedCode) {
            return {
                success: false,
                error: 'The code is invalid or has expired',
            };
        }
        if (cachedCode !== code) {
            return {
                success: false,
                error: 'The code is invalid or has expired',
            };
        }
        // hash the password
        const hashedPassword = await (0, passwordService_1.hashPassword)(newPassword);
        // update the user's password
        await (0, db_user_1.updateUser)(existingUser.id, { password: hashedPassword });
        // delete the code from the Redis store
        await (0, redis_user_1.deleteResetToken)(key);
        return {
            success: true,
            message: 'Password reset successful',
        };
    }
}
exports.default = PasswordController;
//# sourceMappingURL=Passwordcontroller.js.map