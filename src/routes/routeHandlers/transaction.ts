import { RequestHandler } from 'express';
import { verifyPay } from '../../services/paystack/paystack';
import { UserId } from '../../types/custom';
import TransactionController from '../../controllers/Transactioncontroller';
import paginate from '../../utils/pagination';
import { verifyPaySchema } from '../../utils/validators';
import { sendEmail } from '../../services/email/email';
import { findCustomer } from '../../repositories/db.customer';
import { findUser } from '../../repositories/db.user';

export const getTransactionsHandler: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId as UserId;
    const { limit = 10, page = 1, transactionType, from, to } = req.query;

    const Page = Number(page);
    const Limit = Number(limit);

    const response = await TransactionController.getTransactionHistory({
      userId,
      limit: Limit,
      page: Page,
      transactionType: transactionType as 'card' | 'bankTransfer',
      from: from as string,
      to: to as string,
    });

    if (!response.success) {
      return res.status(400).json({
        success: false,
        message: response.message,
      });
    }

    const paginatedTransactions = paginate({
      records: response.data?.transactions || [],
      totalItems: response.data?.totalRecords || 0,
      page: Page,
      limit: Limit,
    });

    return res.json({
      success: true,
      message: response.message,
      data: paginatedTransactions,
    });
  } catch (err: any) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const verifyPayHandler: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId as UserId;
    const { reference } = req.query;
    const { error } = verifyPaySchema.validate({ reference });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    const response = await verifyPay(reference as string);

    const { businessName } = response.data.metadata;

    const payerEmail: string = response.data.metadata.payerDetails.split(':')[0];

    const payer = await findCustomer({ email: payerEmail });
    const businessOwner = await findUser({ id: userId });

    await Promise.all([
      sendEmail({
        recipientEmail: payerEmail,
        templateName: 'payer-payment-successful',
        subject: 'Payment Successful',
        data: { businessName, payerName: payer!.name },
      }),
      sendEmail({
        recipientEmail: businessOwner!.email,
        templateName: 'business-payment-successful',
        subject: `Payment Received`,
        data: { businessName, payerName: payer!.name },
      }),
    ]);

    if (!response.status) {
      return res.status(400).json(response);
    }

    return res.json(response);
  } catch (err: any) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
