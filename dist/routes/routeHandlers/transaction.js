"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTransHandler = exports.getTransactionsHandler = void 0;
const paystack_1 = require("../../services/paystack/paystack");
const Transactioncontroller_1 = __importDefault(require("../../controllers/Transactioncontroller"));
const pagination_1 = __importDefault(require("../../utils/pagination"));
const getTransactionsHandler = async (req, res) => {
    try {
        const userId = req.userId;
        const { limit = 10, page = 1, transactionType, from, to } = req.query;
        const Page = Number(page);
        const Limit = Number(limit);
        const response = await Transactioncontroller_1.default.getTransactionHistory({
            userId,
            limit: Limit,
            page: Page,
            transactionType: transactionType,
            from: from,
            to: to,
        });
        if (!response.success) {
            return res.status(400).json({
                success: false,
                message: response.message,
            });
        }
        const paginatedTransactions = (0, pagination_1.default)({
            records: response.data?.transactions || [],
            totalItems: response.data?.totalRecords || 0,
            page: Page,
            limit: Limit,
        });
        return res.json({
            success: true,
            message: response.message,
            data: paginatedTransactions,
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.getTransactionsHandler = getTransactionsHandler;
const verifyTransHandler = async (req, res) => {
    try {
        const { reference } = req.query;
        // const { error } = verifyPaySchema.validate({ reference });
        // if (error) {
        //   return res.status(400).json({
        //     success: false,
        //     message: error.message,
        //   });
        // }
        const response = await (0, paystack_1.verifyPay)(reference);
        // if (!response.status) {
        //   return res.status(400).json({
        //     success: response.status,
        //     message: response.message,
        //   });
        // }
        return res.json(response);
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.verifyTransHandler = verifyTransHandler;
//# sourceMappingURL=transaction.js.map