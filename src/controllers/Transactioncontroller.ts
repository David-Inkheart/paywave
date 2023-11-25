import { configDotenv } from 'dotenv';

import { initPay } from '../services/paystack/paystack';
import hashArguments from '../utils/hash';
import isDuplicateTxn from '../utils/transactions/checkTransaction';
import { findUser } from '../repositories/db.user';
import { paySchema } from '../utils/validators';

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
    // join both payer and invoice details as a string seperated by a :
    const payerDetails = `${payerEmail}:${invoiceId}`;

    const result = await initPay({ email: user!.email, amount, metadata: { payerDetails } });

    return {
      success: true,
      message: 'Payment initialized',
      data: result,
    };
  }
}

export default TransactionController;
