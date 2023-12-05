import { creditbusinessAccount, getBusinessAccountWithCustomer } from '../../repositories/db.account';
import { updateInvoice } from '../../repositories/db.invoice';
import { recordTransaction } from '../../repositories/db.transactions';
import { findUser } from '../../repositories/db.user';
import { sendEmail } from '../../services/email/email';
import prisma from '../db.server';

async function updateBalance(event: any) {
  try {
    const { email } = event.data.customer;
    const { amount, reference, status, metadata } = event.data;
    if (status !== 'success') throw new Error('Transaction not successful');

    const user = await findUser({ email });

    const payerDetails = metadata.payerDetails as string;

    const [payerEmail, invoiceId] = payerDetails.split(':');

    // find customer with user business account

    const businessAccount = await getBusinessAccountWithCustomer({ userId: user!.id });

    if (!businessAccount) throw new Error('business account not found');

    const payer = businessAccount.customers.find((customer) => customer.email === payerEmail);

    await prisma.$transaction(async (tx) => {
      // credit business account
      await creditbusinessAccount({ amount, businessAccountId: businessAccount.id, txn: tx });

      // update invoice
      const invoice = await updateInvoice({
        invoiceId: Number(invoiceId),
        customerId: payer!.id,
        businessAccountId: businessAccount.id,
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
          businessAccountId: businessAccount.id,
          metadata,
        },
        tx,
      );
    });

    // send email to customer and business owner
    const { businessName } = businessAccount;

    await Promise.all([
      sendEmail({
        recipientEmail: payerEmail,
        templateName: 'payer-payment-successful',
        subject: 'Payment Successful',
        data: { businessName, payerName: payer!.name },
      }),
      sendEmail({
        recipientEmail: email,
        templateName: 'business-payment-successful',
        subject: `Payment Received`,
        data: { businessName, payerName: payer!.name },
      }),
    ]);
  } catch (error) {
    console.log(error);
  }
  return {
    success: true,
    message: 'payment successful',
  };
}
export default updateBalance;
