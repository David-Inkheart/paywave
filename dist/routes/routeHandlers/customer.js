"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCustomerHandler = exports.updateCustomerHandler = exports.deleteCustomerHandler = exports.getAllCustomersHandler = exports.getCustomerHandler = void 0;
const Customercontrollers_1 = __importDefault(require("../../controllers/Customercontrollers"));
const getCustomerHandler = async (req, res) => {
    try {
        const customerEmail = req.body.customerEmail;
        const response = await Customercontrollers_1.default.getCustomer(customerEmail);
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
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};
exports.getCustomerHandler = getCustomerHandler;
const getAllCustomersHandler = async (req, res) => {
    try {
        const userId = req.userId;
        const response = await Customercontrollers_1.default.getCustomers(userId);
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
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};
exports.getAllCustomersHandler = getAllCustomersHandler;
const deleteCustomerHandler = async (req, res) => {
    try {
        const customerEmail = req.body.customerEmail;
        const response = await Customercontrollers_1.default.deleteCustomer(customerEmail);
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
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};
exports.deleteCustomerHandler = deleteCustomerHandler;
const updateCustomerHandler = async (req, res) => {
    try {
        const { customerEmail, customerName } = req.body;
        const response = await Customercontrollers_1.default.updateCustomer({ customerEmail, customerName });
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
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};
exports.updateCustomerHandler = updateCustomerHandler;
const createCustomerHandler = async (req, res) => {
    try {
        const userId = req.userId;
        const { customerName, customerEmail } = req.body;
        const response = await Customercontrollers_1.default.createCustomer({ userId, customerName, customerEmail });
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
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};
exports.createCustomerHandler = createCustomerHandler;
//# sourceMappingURL=customer.js.map