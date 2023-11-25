"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookHandler = void 0;
const authHash_1 = __importDefault(require("../../services/paystack/authHash"));
const updateBalanceService_1 = __importDefault(require("../../utils/transactions/updateBalanceService"));
const webhookHandler = async (req, res) => {
    const hash = (0, authHash_1.default)(req.body);
    if (hash === req.headers['x-paystack-signature']) {
        // get event from request body
        const event = req.body;
        // do something with event
        try {
            let response;
            if (event.event === 'charge.success') {
                response = await (0, updateBalanceService_1.default)(event);
            }
            console.log(response);
        }
        catch (error) {
            console.log(error);
        }
    }
    res.sendStatus(200);
};
exports.webhookHandler = webhookHandler;
//# sourceMappingURL=paystackWebhook.js.map