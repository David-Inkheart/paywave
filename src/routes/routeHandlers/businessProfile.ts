import { RequestHandler } from 'express';
import { UserId } from '../../types/custom';
import BusinessDetailsController from '../../controllers/BusinessDetailscontroller';

export const getBusinessDetailsHandler: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId as UserId;

    const response = await BusinessDetailsController.getBusinessDetails(userId);

    if (!response.success) {
      return res.status(400).json({
        success: false,
        error: response.error,
      });
    }

    return res.json({
      success: response.success,
      data: response.data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

export const updateBusinessDetailsHandler: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId as UserId;
    const { streetAddress, city, businessName, country } = req.body;

    const response = await BusinessDetailsController.updateBusinessDetails({
      userId,
      streetAddress,
      city,
      businessName,
      country,
    });

    if (!response.success) {
      return res.status(400).json({
        success: false,
        error: response.error,
      });
    }

    return res.json({
      success: response.success,
      message: 'Business details updated successfully',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

export const updatePaymentDetailsHandler: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId as UserId;
    const bankCode = req.body.bankCode as string;
    const accountNumber = req.body.accountNumber as string;
    const accountName = req.body.accountName as string;

    const response = await BusinessDetailsController.updatePaymentDetails({
      userId,
      bankCode,
      accountNumber,
      accountName,
    });

    if (!response.success) {
      if (response.error?.includes('not')) {
        return res.status(500).json({
          success: false,
          error: response.error,
        });
      }
      return res.status(400).json({
        success: false,
        error: response.error,
      });
    }

    return res.json({
      success: response.success,
      message: 'Payment details updated successfully',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};
