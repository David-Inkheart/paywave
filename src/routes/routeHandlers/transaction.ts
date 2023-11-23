import { RequestHandler } from 'express';
import { listBanks, verifyPay } from '../../services/paystack/paystack';
import { verifyPaySchema } from '../../utils/validators';

export const verifyTransHandler: RequestHandler = async (req, res) => {
  try {
    const { reference } = req.query;
    const { error } = verifyPaySchema.validate({ reference });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

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

export const listBanksHandler: RequestHandler = async (_, res) => {
  try {
    return res.json(await listBanks());
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'internal server error',
    });
  }
};
