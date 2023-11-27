import { creditbusinessAccount, findbusinessAccountbyUserId } from '../../repositories/db.account';
import { findCustomer } from '../../repositories/db.customer';
import { updateInvoice } from '../../repositories/db.invoice';
import { recordTransaction } from '../../repositories/db.transactions';
import { findUser } from '../../repositories/db.user';
import prisma from '../db.server';

async function updateBalance(event: any) {
  try {
    const { email } = event.data.customer;
    const { amount, reference, status, metadata } = event.data;
    if (status !== 'success') throw new Error('Transaction not successful');

    const user = await findUser({ email });

    const payerDetails = metadata.payerDetails as string;

    const [payerEmail, invoiceId] = payerDetails.split(':');

    // find customer with email
    const payer = await findCustomer({ email: payerEmail });

    const businessAccount = await findbusinessAccountbyUserId(user!.id);

    await prisma.$transaction(async (tx) => {
      // credit business account
      await creditbusinessAccount({ amount, businessAccountId: businessAccount[0].id, txn: tx });

      // update invoice
      const invoice = await updateInvoice({
        invoiceId: Number(invoiceId),
        customerId: payer!.id,
        businessAccountId: businessAccount[0].id,
        totalAmount: amount,
        paymentStatus: 'PAID',
        reference,
        txn: tx,
      });

      if (!invoice) throw new Error('invoice not found');

      // record transaction
      await recordTransaction(
        {
          customerId: payer!.id,
          invoiceId: Number(invoiceId),
          amount,
          reference,
          transactionType: 'card',
          businessAccountId: businessAccount[0].id,
          metadata,
        },
        tx,
      );
    });
  } catch (error) {
    console.log(error);
  }
  return {
    success: true,
    message: 'payment successful',
  };
}
export default updateBalance;
