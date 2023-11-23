"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listBanksHandler = exports.verifyTransHandler = void 0;
const paystack_1 = require("../../services/paystack/paystack");
const validators_1 = require("../../utils/validators");
const verifyTransHandler = async (req, res) => {
    try {
        const { reference } = req.query;
        const { error } = validators_1.verifyPaySchema.validate({ reference });
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
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
const listBanksHandler = async (_, res) => {
    try {
        return res.json(await (0, paystack_1.listBanks)());
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: 'internal server error',
        });
    }
};
exports.listBanksHandler = listBanksHandler;
//# sourceMappingURL=transaction.js.map