import { Item } from '@prisma/client';
import { findbusinessAccount, getBusinessAccountWithCustomer } from '../repositories/db.account';
import { UserId } from '../types/custom';
import { createInvoiceSchema, invoiceIdSchema } from '../utils/validators';
import { createInvoice, getAllInvoices, getInvoice } from '../repositories/db.invoice';
import hashArguments from '../utils/hash';
import isDuplicateTxn from '../utils/transactions/checkTransaction';
import { sendEmail } from '../services/email/email';
import { findCustomer } from '../repositories/db.customer';

class InvoiceController {
  static async createPaymentInvoice({ userId, customerId, items }: { userId: UserId; customerId: number; items: Item[] }) {
    try {
      const { error } = createInvoiceSchema.validate({ userId, customerId, items });

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

      const customerDetails = businessAccount.customers.find((customer) => customer.id === customerId);
      if (!customerDetails) {
        return {
          success: false,
          error: 'Customer does not exist',
        };
      }

      // Aggregate the total amount of the invoice
      const totalAmount = items.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);

      // Payment due date is 24 hours from now
      const paymentDueDate = new Date();
      paymentDueDate.setDate(paymentDueDate.getDate() + 1);

      // indempotency for invoice creation (60secs)
      const hashedArgs = hashArguments({ userId, customerId, totalAmount, paymentDueDate, items });
      const isDuplicate = await isDuplicateTxn(businessAccount.businessName, hashedArgs);

      if (isDuplicate) {
        return {
          success: false,
          error: 'Invoice already exists',
        };
      }

      await Promise.all([
        createInvoice({ businessAccountId: businessAccount.id, customerId, totalAmount, paymentDueDate, items }),
        sendEmail({
          recipientEmail: customerDetails.email,
          templateName: 'invoice',
          subject: `Invoice from ${businessAccount.businessName}`,
          data: {
            businessName: businessAccount.businessName,
            customerName: customerDetails.name,
            // divide by 100 to get the actual amount and add the currency
            totalAmount: `${totalAmount / 100} NGN`,
            paymentDueDate,
            items,
          },
        }),
      ]);

      return {
        success: true,
        message: 'Invoice created successfully',
      };
    } catch (error) {
      console.log('error::::: ', error);
      return {
        success: false,
        error: 'Could not create invoice, please try again later',
      };
    }
  }

  static async getPaymentInvoice({ userId, invoiceId }: { userId: UserId; invoiceId: number }) {
    try {
      const { error } = invoiceIdSchema.validate(invoiceId);

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

      const invoice = await getInvoice(invoiceId);

      if (!invoice) {
        return {
          success: false,
          error: 'Invoice does not exist',
        };
      }

      const customerDetails = await findCustomer({ id: invoice.customerId });

      // Merge the invoice and business account details
      const invoicedetails = {
        invoice: {
          ...invoice,
          customerName: customerDetails!.name,
          customerEmail: customerDetails!.email,
        },
        businessAccount,
      };

      return {
        success: true,
        data: invoicedetails,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Could not get invoice, please try again later',
      };
    }
  }

  static async getAllPaymentInvoices({ userId }: { userId: UserId }) {
    try {
      const businessAccount = await findbusinessAccount({ userId });

      if (!businessAccount) {
        return {
          success: false,
          error: 'business account does not exist',
        };
      }

      // Get the invoices and their items
      const invoices = await getAllInvoices(businessAccount.id);

      if (!invoices) {
        return {
          success: false,
          error: 'Invoices do not exist',
        };
      }

      return {
        success: true,
        data: invoices,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Could not get invoices, please try again later',
      };
    }
  }
}

export default InvoiceController;
