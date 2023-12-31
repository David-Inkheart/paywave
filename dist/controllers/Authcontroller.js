"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const passwordService_1 = require("../utils/passwordService");
const validators_1 = require("../utils/validators");
const db_user_1 = require("../repositories/db.user");
const email_1 = require("../services/email/email");
const db_account_1 = require("../repositories/db.account");
class AuthController {
    static async register({ firstName, lastName, businessName, phoneNumber, email, password, }) {
        // validate user input
        const { error } = validators_1.registerSchema.validate({ firstName, lastName, businessName, phoneNumber, email, password });
        if (error) {
            return {
                success: false,
                error: error.message,
            };
        }
        // check if user is already existing email or phone number
        const existingUser = await (0, db_user_1.findUserByEmailOrPhone)({
            OR: [{ email }, { phoneNumber }],
        });
        if (existingUser) {
            return {
                success: false,
                error: 'User with same email or phoneNumber already exists',
            };
        }
        const hashedPassword = await (0, passwordService_1.hashPassword)(password);
        // check if business name is already existing
        const existingBusiness = await (0, db_account_1.findbusinessAccount)({ businessName });
        if (existingBusiness) {
            return {
                success: false,
                error: 'Business with same name already exists',
            };
        }
        // create user and business account
        const newUser = await (0, db_user_1.createUser)({
            firstName,
            lastName,
            phoneNumber,
            email,
            password: hashedPassword,
        }, businessName);
        // generate jwt Token
        const token = jsonwebtoken_1.default.sign({ userId: newUser.id }, process.env.JWT_SECRET, {
            expiresIn: '24h',
        });
        // send welcome email
        await (0, email_1.sendEmail)({
            recipientEmail: newUser.email,
            templateName: 'welcome',
            subject: 'Welcome to paywave',
            data: { businessName },
        });
        return {
            success: true,
            message: 'User registered successfully',
            token,
        };
    }
    static async login({ email, password }) {
        // validate user input
        const { error } = validators_1.loginSchema.validate({ email, password });
        if (error) {
            return {
                success: false,
                error: error.message,
            };
        }
        // Find the user by email
        const user = await (0, db_user_1.findUser)({ email });
        if (!user) {
            return {
                success: false,
                error: 'Email/password mismatch',
            };
        }
        // Compare the password
        const isMatch = await (0, passwordService_1.comparePasswords)(password, user.password);
        if (!isMatch) {
            return {
                success: false,
                error: 'Email/password mismatch',
            };
        }
        // Generate JWT token that expires in 24 hour
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, {
            expiresIn: '24h',
        });
        // find businessAccount
        const businessAccount = await (0, db_account_1.findbusinessAccount)({ userId: user.id });
        await (0, email_1.sendEmail)({
            recipientEmail: user.email,
            templateName: 'login-successful',
            subject: 'Login Successful',
            data: { businessName: businessAccount?.businessName },
        });
        return {
            success: true,
            message: 'User logged in successfully',
            token,
        };
    }
}
exports.default = AuthController;
//# sourceMappingURL=Authcontroller.js.map