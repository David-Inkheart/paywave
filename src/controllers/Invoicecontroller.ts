import { Item } from '@prisma/client';
import { findbusinessAccount } from '../repositories/db.account';
import { UserId } from '../types/custom';
import { createInvoiceSchema } from '../utils/validators';
import { createInvoice } from '../repositories/db.invoice';
import hashArguments from '../utils/hash';
import isDuplicateTxn from '../utils/transactions/checkTransaction';

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

      const businessAccount = await findbusinessAccount({ userId });

      if (!businessAccount) {
        return {
          success: false,
          error: 'business account does not exist',
        };
      }

      // Aggregate the total amount of the invoice
      const totalAmount = items.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);

      // Payment due date is 24 hours from now
      const paymentDueDate = new Date();
      paymentDueDate.setDate(paymentDueDate.getDate() + 1);

      // indempotency for invoice creation (60secs)
      const hashedArgs = hashArguments({ userId, customerId, totalAmount, paymentDueDate, items });
      const isDuplicate = await isDuplicateTxn(businessAccount.id.toString(), hashedArgs);

      if (isDuplicate) {
        return {
          success: false,
          error: 'Invoice already exists',
        };
      }

      // Create the invoice and connect items
      await createInvoice({ businessAccountId: businessAccount.id, customerId, totalAmount, paymentDueDate, items });

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
}

export default InvoiceController;
