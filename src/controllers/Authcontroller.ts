import jwt from 'jsonwebtoken';
import { hashPassword, comparePasswords } from '../utils/passwordService';
import { registerSchema, loginSchema } from '../utils/validators';
import { createUser, findUser, findUserByEmailOrPhone } from '../repositories/db.user';
import { sendEmail } from '../services/email/email';
import { findbusinessAccount } from '../repositories/db.account';

class AuthController {
  static async register({
    firstName,
    lastName,
    businessName,
    phoneNumber,
    email,
    password,
  }: {
    firstName: string;
    lastName: string;
    businessName: string;
    phoneNumber: string;
    email: string;
    password: string;
  }) {
    // validate user input
    const { error } = registerSchema.validate({ firstName, lastName, businessName, phoneNumber, email, password });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }
    // check if user is already existing email or phone number
    const existingUser = await findUserByEmailOrPhone({
      OR: [{ email }, { phoneNumber }],
    });

    if (existingUser) {
      return {
        success: false,
        error: 'User with same email or phoneNumber already exists',
      };
    }

    const hashedPassword = await hashPassword(password);

    // check if business name is already existing
    const existingBusiness = await findbusinessAccount({ businessName });

    if (existingBusiness) {
      return {
        success: false,
        error: 'Business with same name already exists',
      };
    }

    // create user and business account
    const newUser = await createUser(
      {
        firstName,
        lastName,
        phoneNumber,
        email,
        password: hashedPassword,
      },
      businessName,
    );

    // generate jwt Token
    const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET!, {
      expiresIn: '24h',
    });

    // send welcome email
    await sendEmail({
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

  static async login({ email, password }: { email: string; password: string }) {
    // validate user input
    const { error } = loginSchema.validate({ email, password });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }
    // Find the user by email
    const user = await findUser({ email });
    if (!user) {
      return {
        success: false,
        error: 'Email/password mismatch',
      };
    }
    // Compare the password
    const isMatch = await comparePasswords(password, user.password);

    if (!isMatch) {
      return {
        success: false,
        error: 'Email/password mismatch',
      };
    }
    // Generate JWT token that expires in 24 hour
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: '24h',
    });

    // find businessAccount
    const businessAccount = await findbusinessAccount({ userId: user.id });

    await sendEmail({
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

export default AuthController;
