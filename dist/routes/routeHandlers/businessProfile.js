"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePaymentDetailsHandler = exports.updateBusinessDetailsHandler = exports.getBusinessDetailsHandler = void 0;
const BusinessDetailscontroller_1 = __importDefault(require("../../controllers/BusinessDetailscontroller"));
const getBusinessDetailsHandler = async (req, res) => {
    try {
        const userId = req.userId;
        const response = await BusinessDetailscontroller_1.default.getBusinessDetails(userId);
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
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};
exports.getBusinessDetailsHandler = getBusinessDetailsHandler;
const updateBusinessDetailsHandler = async (req, res) => {
    try {
        const userId = req.userId;
        const { streetAddress, city, businessName, country } = req.body;
        const response = await BusinessDetailscontroller_1.default.updateBusinessDetails({
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
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};
exports.updateBusinessDetailsHandler = updateBusinessDetailsHandler;
const updatePaymentDetailsHandler = async (req, res) => {
    try {
        const userId = req.userId;
        const bankCode = req.body.bankCode;
        const accountNumber = req.body.accountNumber;
        const accountName = req.body.accountName;
        const response = await BusinessDetailscontroller_1.default.updatePaymentDetails({
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
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};
exports.updatePaymentDetailsHandler = updatePaymentDetailsHandler;
//# sourceMappingURL=businessProfile.js.map