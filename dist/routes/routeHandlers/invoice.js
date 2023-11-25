"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllInvoicesHandler = exports.getInvoiceHandler = exports.createInvoiceHandler = void 0;
const Invoicecontroller_1 = __importDefault(require("../../controllers/Invoicecontroller"));
const createInvoiceHandler = async (req, res) => {
    try {
        const userId = req.userId;
        const customerId = Number(req.params.customerId);
        const items = req.body.items;
        const response = await Invoicecontroller_1.default.createPaymentInvoice({ userId, customerId, items });
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
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};
exports.createInvoiceHandler = createInvoiceHandler;
const getInvoiceHandler = async (req, res) => {
    try {
        const userId = req.userId;
        const invoiceId = Number(req.params.invoiceId);
        const response = await Invoicecontroller_1.default.getPaymentInvoice({ userId, invoiceId });
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
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};
exports.getInvoiceHandler = getInvoiceHandler;
const getAllInvoicesHandler = async (req, res) => {
    try {
        const userId = req.userId;
        const response = await Invoicecontroller_1.default.getAllPaymentInvoices({ userId });
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
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};
exports.getAllInvoicesHandler = getAllInvoicesHandler;
//# sourceMappingURL=invoice.js.map