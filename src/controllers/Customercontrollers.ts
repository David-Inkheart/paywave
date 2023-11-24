import { findbusinessAccount } from '../repositories/db.account';
import { createCustomer, deleteCustomer, findCustomer, getBusinessCustomers, updateCustomer } from '../repositories/db.customer';
import { UserId } from '../types/custom';
import { customerDetailSchema, customerEmailSchema } from '../utils/validators';

class CustomerController {
  static async createCustomer({ userId, customerName, customerEmail }: { userId: UserId; customerName: string; customerEmail: string }) {
    try {
      const { error } = customerDetailSchema.validate({ customerName, customerEmail });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      const businessAccount = await findbusinessAccount({ userId });

      if (!businessAccount) {
        return {
          success: false,
          error: 'business account does not exist',
        };
      }

      await createCustomer({
        name: customerName,
        email: customerEmail,
        businessAccount: {
          connect: {
            id: businessAccount.id,
          },
        },
      });

      return {
        success: true,
        message: 'Customer created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Could not create customer',
      };
    }
  }

  static async updateCustomer({ customerName, customerEmail }: { customerName: string; customerEmail: string }) {
    try {
      const { error } = customerDetailSchema.validate({ customerName, customerEmail });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      const customer = await findCustomer({ email: customerEmail });

      if (!customer) {
        return {
          success: false,
          error: 'Customer does not exist',
        };
      }

      await updateCustomer({ email: customerEmail }, { name: customerName });

      return {
        success: true,
        message: 'Customer details updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Could not update customer',
      };
    }
  }

  static async deleteCustomer(customerEmail: string) {
    try {
      const { error } = customerEmailSchema.validate({ customerEmail });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      const customer = await findCustomer({ email: customerEmail });

      if (!customer) {
        return {
          success: false,
          error: 'Customer does not exist',
        };
      }

      await deleteCustomer({ email: customerEmail });

      return {
        success: true,
        message: 'Customer deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Could not delete customer',
      };
    }
  }

  static async getCustomer(customerEmail: string) {
    try {
      const { error } = customerEmailSchema.validate({ customerEmail });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      const customer = await findCustomer({ email: customerEmail });

      if (!customer) {
        return {
          success: false,
          error: 'Customer does not exist',
        };
      }

      return {
        success: true,
        data: customer,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Could not fetch customer',
      };
    }
  }

  static async getCustomers(userId: UserId) {
    try {
      const businessAccount = await findbusinessAccount({ userId });

      if (!businessAccount) {
        return {
          success: false,
          error: 'business account does not exist',
        };
      }

      const customers = await getBusinessCustomers(businessAccount.id);

      return {
        success: true,
        data: customers,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Could not fetch customers',
      };
    }
  }
}

export default CustomerController;
