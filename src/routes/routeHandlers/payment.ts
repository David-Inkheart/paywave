import { RequestHandler } from 'express';
import { UserId } from '../../types/custom';
import TransactionController from '../../controllers/Transactioncontroller';

export const paymentHandler: RequestHandler = async (req, res) => {
  try {
    const { amount, payerEmail } = req.body;
    const userId = req.userId as UserId;
    const invoiceId = Number(req.params.invoiceId);

    const response = await TransactionController.paymentInit({
      userId,
      invoiceId,
      payerEmail,
      amount,
    });

    if (!response.success) {
      return res.status(400).json({
        success: response.success,
        message: response.message,
      });
    }

    return res.json(response);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
