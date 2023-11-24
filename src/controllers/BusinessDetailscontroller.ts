import { Country } from '@prisma/client';
import { findbusinessAccount, updatebusinessAccount } from '../repositories/db.account';
import { findUser } from '../repositories/db.user';
import { UserId } from '../types/custom';
import { businessDetailsSchema, paymentDetailsSchema } from '../utils/validators';

class BusinessDetailsController {
  static async getBusinessDetails(userId: UserId) {
    try {
      const [userDetails, businessAcc] = await Promise.all([findUser({ id: userId }), findbusinessAccount({ id: userId })]);

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

      const businessAcc = await findbusinessAccount({ id: userId });

      if (!businessAcc) {
        return {
          success: false,
          error: 'business account does not exist',
        };
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

      const businessAcc = await findbusinessAccount({ id: userId });

      if (!businessAcc) {
        return {
          success: false,
          error: 'business account does not exist',
        };
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