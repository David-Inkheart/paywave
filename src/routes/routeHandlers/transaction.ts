import { RequestHandler } from 'express';
import { verifyPay } from '../../services/paystack/paystack';
import { UserId } from '../../types/custom';
import TransactionController from '../../controllers/Transactioncontroller';
import paginate from '../../utils/pagination';

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

export const verifyTransHandler: RequestHandler = async (req, res) => {
  try {
    const { reference } = req.query;
    // const { error } = verifyPaySchema.validate({ reference });

    // if (error) {
    //   return res.status(400).json({
    //     success: false,
    //     message: error.message,
    //   });
    // }

    const response = await verifyPay(reference as string);

    // if (!response.status) {
    //   return res.status(400).json({
    //     success: response.status,
    //     message: response.message,
    //   });
    // }

    return res.json(response);
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
