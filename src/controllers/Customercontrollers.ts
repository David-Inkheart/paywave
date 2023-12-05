import { getBusinessAccountWithCustomer } from '../repositories/db.account';
import { createCustomer, deleteCustomer, updateCustomer } from '../repositories/db.customer';
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

      const businessAccount = await getBusinessAccountWithCustomer({ userId });

      if (!businessAccount) {
        return {
          success: false,
          error: 'business account does not exist',
        };
      }

      if (businessAccount.customers.some((customer) => customer.email === customerEmail)) {
        return {
          success: false,
          error: 'Customer already exists',
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

  static async updateCustomer({ userId, customerName, customerEmail }: { userId: UserId; customerName: string; customerEmail: string }) {
    try {
      const { error } = customerDetailSchema.validate({ customerName, customerEmail });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      // const customer = await findCustomer({ email: customerEmail });

      // if (!customer) {
      //   return {
      //     success: false,
      //     error: 'Customer does not exist',
      //   };
      // }

      const businessAccWithCustomer = await getBusinessAccountWithCustomer({ userId });

      if (!businessAccWithCustomer) {
        return {
          success: false,
          error: 'business account does not exist',
        };
      }

      const customer = businessAccWithCustomer.customers.find((cust) => cust.email === customerEmail);
      if (!customer) {
        return {
          success: false,
          error: 'Customer does not exist',
        };
      }

      await updateCustomer({ id: customer.id }, { name: customerName, email: customerEmail });

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

  static async deleteCustomer({ userId, customerEmail }: { userId: UserId; customerEmail: string }) {
    try {
      const { error } = customerEmailSchema.validate({ customerEmail });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      const businessAccount = await getBusinessAccountWithCustomer({ userId });

      if (!businessAccount) {
        return {
          success: false,
          error: 'business account does not exist',
        };
      }

      const customer = businessAccount.customers.find((cust) => cust.email === customerEmail);
      if (!customer) {
        return {
          success: false,
          error: 'Customer does not exist',
        };
      }

      await deleteCustomer({ id: customer.id });

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

  static async getCustomer({ userId, customerEmail }: { userId: UserId; customerEmail: string }) {
    try {
      const { error } = customerEmailSchema.validate({ customerEmail });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      const businessAccount = await getBusinessAccountWithCustomer({ userId });

      if (!businessAccount) {
        return {
          success: false,
          error: 'business account does not exist',
        };
      }

      const customer = businessAccount.customers.find((cust) => cust.email === customerEmail);

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
      const businessAccount = await getBusinessAccountWithCustomer({ userId });

      if (!businessAccount) {
        return {
          success: false,
          error: 'business account does not exist',
        };
      }

      const { customers } = businessAccount;

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
