"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTransHandler = void 0;
const paystack_1 = require("../../services/paystack/paystack");
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