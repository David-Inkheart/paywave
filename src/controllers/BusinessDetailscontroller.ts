import { Country } from '@prisma/client';
import { findbusinessAccount, updatebusinessAccount } from '../repositories/db.account';
import { findUser } from '../repositories/db.user';
import { UserId } from '../types/custom';
import { businessDetailsSchema, idSchema, paymentDetailsSchema } from '../utils/validators';

class BusinessDetailsController {
  static async getBusinessDetails(userId: UserId) {
    try {
      const { error } = idSchema.validate(userId);
      console.log('userId:', userId);
      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      const [userDetails, businessAcc] = await Promise.all([findUser({ id: userId }), findbusinessAccount({ userId })]);
      console.log('userDetails:', userDetails);
      console.log('businessAcc:', businessAcc);

      if (!userDetails || !businessAcc) {
        return {
          success: false,
          error: 'business account does not exist',
        };
      }

      const businessDetails = {
        ...businessAcc,
        email: userDetails.email,
        phoneNumber: userDetails.phoneNumber,
      };

      return {
        success: true,
        data: businessDetails,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Could not get business details',
      };
    }
  }

  static async updateBusinessDetails({
    userId,
    streetAddress,
    city,
    businessName,
    country,
  }: {
    userId: UserId;
    streetAddress: string;
    city: string;
    businessName: string;
    country: Country;
  }) {
    try {
      const { error } = businessDetailsSchema.validate({ streetAddress, city, businessName, country });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      const businessAcc = await findbusinessAccount({ userId });

      if (!businessAcc) {
        return {
          success: false,
          error: 'business account does not exist',
        };
      }

      if (businessAcc.businessName !== businessName) {
        const businessNameExists = await findbusinessAccount({ businessName });

        if (businessNameExists) {
          return {
            success: false,
            error: 'business name already exists',
          };
        }
      }
      await updatebusinessAccount(businessAcc.id, { streetAddress, city, businessName, country });

      return {
        success: true,
        message: 'business details updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Could not update business details',
      };
    }
  }

  static async updatePaymentDetails({
    userId,
    bankCode,
    accountNumber,
    accountName,
  }: {
    userId: UserId;
    bankCode: string;
    accountNumber: string;
    accountName: string;
  }) {
    try {
      const { error } = paymentDetailsSchema.validate({ bankCode, accountNumber, accountName });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      const businessAcc = await findbusinessAccount({ userId });

      if (!businessAcc) {
        return {
          success: false,
          error: 'business account does not exist',
        };
      }

      if (businessAcc.accountNumber !== accountNumber) {
        const accountNumberExists = await findbusinessAccount({ accountNumber });

        if (accountNumberExists) {
          return {
            success: false,
            error: 'account number already exists',
          };
        }
      }

      await updatebusinessAccount(businessAcc.id, { bankCode, accountNumber, accountName });

      return {
        success: true,
        message: 'Payment details updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Could not update payment details, please try again later',
      };
    }
  }
}

export default BusinessDetailsController;
