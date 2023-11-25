"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentHandler = void 0;
const Transactioncontroller_1 = __importDefault(require("../../controllers/Transactioncontroller"));
const paymentHandler = async (req, res) => {
    try {
        const { amount, payerEmail } = req.body;
        const userId = req.userId;
        const invoiceId = Number(req.params.invoiceId);
        const response = await Transactioncontroller_1.default.paymentInit({
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
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.paymentHandler = paymentHandler;
//# sourceMappingURL=payment.js.map