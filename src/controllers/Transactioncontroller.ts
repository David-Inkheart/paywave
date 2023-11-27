import { configDotenv } from 'dotenv';

import { initPay } from '../services/paystack/paystack';
import hashArguments from '../utils/hash';
import isDuplicateTxn from '../utils/transactions/checkTransaction';
import { findUser } from '../repositories/db.user';
import { paySchema, transactionHistorySchema } from '../utils/validators';
import { findCustomer } from '../repositories/db.customer';
import { getInvoice } from '../repositories/db.invoice';
import { getTransactions } from '../repositories/db.transactions';
import { findbusinessAccount } from '../repositories/db.account';

configDotenv();

class TransactionController {
  static async paymentInit({ userId, invoiceId, payerEmail, amount }: { userId: number; invoiceId: number; payerEmail: string; amount: number }) {
    const { error } = paySchema.validate({ amount, userId, invoiceId, payerEmail });

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    const hashedArgs = hashArguments(amount, userId, invoiceId, payerEmail);
    const isDuplicate = await isDuplicateTxn(userId.toString(), hashedArgs);

    if (isDuplicate) {
      return {
        success: false,
        message: 'Duplicate transaction',
      };
    }

    const user = await findUser({ id: userId });

    if (!user) {
      return {
        success: false,
        message: 'User does not exist',
      };
    }

    const payer = await findCustomer({ email: payerEmail });

    if (!payer) {
      return {
        success: false,
        message: 'Customer does not exist',
      };
    }

    const businessAccount = await findbusinessAccount({ userId });

    if (!businessAccount) {
      return {
        success: false,
        message: 'Business account does not exist',
      };
    }

    const { businessName } = businessAccount;

    const invoice = await getInvoice(invoiceId);

    if (!invoice) {
      return {
        success: false,
        message: 'Invoice does not exist',
      };
    }

    if (invoice.paymentStatus === 'PAID' && invoice.reference != null) {
      return {
        success: false,
        message: 'Invoice already paid',
      };
    }

    const payerDetails = `${payerEmail}:${invoiceId}`;

    const result = await initPay({ email: user!.email, amount, metadata: { payerDetails, businessName } });

    return {
      success: true,
      message: 'Payment initialized',
      data: result,
    };
  }

  static async getTransactionHistory({
    userId,
    limit,
    page,
    transactionType,
    from,
    to,
  }: {
    userId: number;
    limit?: number;
    page: number;
    transactionType?: 'card' | 'bankTransfer';
    from?: string;
    to?: string;
  }) {
    const { error } = transactionHistorySchema.validate({ limit, page, transactionType, from, to });
    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    const transactions = await getTransactions({ userId, limit, page, from, to, transactionType });

    return {
      success: true,
      message: 'Transactions fetched successfully',
      data: transactions,
    };
  }
}

export default TransactionController;
