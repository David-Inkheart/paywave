import { RequestHandler } from 'express';
import { UserId } from '../../types/custom';
import CustomerController from '../../controllers/Customercontrollers';

export const getCustomerHandler: RequestHandler = async (req, res) => {
  try {
    const customerEmail = req.body.customerEmail as string;

    const response = await CustomerController.getCustomer(customerEmail);

    if (!response.success) {
      if (response.error?.includes('Could not')) {
        return res.status(500).json({
          success: false,
          error: response.error,
        });
      }
      if (response.error === 'Customer does not exist') {
        return res.status(404).json({
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

export const getAllCustomersHandler: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId as UserId;

    const response = await CustomerController.getCustomers(userId);

    if (!response.success) {
      if (response.error?.includes('Could not')) {
        return res.status(500).json({
          success: false,
          error: response.error,
        });
      }
      if (response.error === 'business account does not exist') {
        return res.status(404).json({
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

export const deleteCustomerHandler: RequestHandler = async (req, res) => {
  try {
    const customerEmail = req.body.customerEmail as string;

    const response = await CustomerController.deleteCustomer(customerEmail);

    if (!response.success) {
      if (response.error?.includes('Could not')) {
        return res.status(500).json({
          success: false,
          error: response.error,
        });
      }
      if (response.error === 'Customer does not exist') {
        return res.status(404).json({
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

export const updateCustomerHandler: RequestHandler = async (req, res) => {
  try {
    const { customerEmail, customerName } = req.body;

    const response = await CustomerController.updateCustomer({ customerEmail, customerName });

    if (!response.success) {
      if (response.error?.includes('Could not')) {
        return res.status(500).json({
          success: false,
          error: response.error,
        });
      }
      if (response.error === 'Customer does not exist') {
        return res.status(404).json({
          success: false,
          error: response.error,
        });
      }
      if (response.error === 'Customer already exists') {
        return res.status(409).json({
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

export const createCustomerHandler: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId as UserId;
    const { customerName, customerEmail } = req.body;

    const response = await CustomerController.createCustomer({ userId, customerName, customerEmail });

    if (!response.success) {
      if (response.error?.includes('Could not')) {
        return res.status(500).json({
          success: false,
          error: response.error,
        });
      }
      if (response.error === 'Customer already exists') {
        return res.status(409).json({
          success: false,
          error: response.error,
        });
      }
      if (response.error === 'business account does not exist') {
        return res.status(404).json({
          success: false,
          error: response.error,
        });
      }
      if (response.error === 'Customer already exists') {
        return res.status(409).json({
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
