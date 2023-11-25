import { RequestHandler } from 'express';
import { Item } from '@prisma/client';
import { UserId } from '../../types/custom';
import InvoiceController from '../../controllers/Invoicecontroller';

export const createInvoiceHandler: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId as UserId;
    const customerId = Number(req.params.customerId);
    const items = req.body.items as Item[];

    const response = await InvoiceController.createPaymentInvoice({ userId, customerId, items });

    if (!response.success) {
      if (response.error === 'business account does not exist') {
        return res.status(500).json({
          success: false,
          error: response.error,
        });
      }
      if (response.error === 'Could not create invoice, please try again later') {
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
      message: response.message,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

export const getInvoiceHandler: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId as UserId;
    const invoiceId = Number(req.params.invoiceId);

    const response = await InvoiceController.getPaymentInvoice({ userId, invoiceId });

    if (!response.success) {
      if (response.error === 'business account does not exist') {
        return res.status(500).json({
          success: false,
          error: response.error,
        });
      }
      if (response.error === 'Invoice does not exist') {
        return res.status(400).json({
          success: false,
          error: response.error,
        });
      }
      if (response.error === 'Could not get invoice, please try again later') {
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
      data: response.data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

export const getAllInvoicesHandler: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId as UserId;

    const response = await InvoiceController.getAllPaymentInvoices({ userId });

    if (!response.success) {
      if (response.error === 'business account does not exist') {
        return res.status(500).json({
          success: false,
          error: response.error,
        });
      }
      if (response.error === 'Could not get invoices, please try again later') {
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
      data: response.data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};
