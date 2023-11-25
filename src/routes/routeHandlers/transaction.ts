import { RequestHandler } from 'express';
import { verifyPay } from '../../services/paystack/paystack';

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
