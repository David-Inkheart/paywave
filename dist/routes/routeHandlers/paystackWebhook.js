"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookHandler = void 0;
const authHash_1 = __importDefault(require("../../services/paystack/authHash"));
const webhookHandler = async (req, res) => {
    const hash = (0, authHash_1.default)(req.body);
    if (hash === req.headers['x-paystack-signature']) {
        // get event from request body
        const event = req.body;
        // do something with event
        try {
            let response;
            if (event.event === 'charge.success') {
                // response = await fundAccount(event);
            }
            if (event.event === 'transfer.success') {
                // response = await withdrawfromAccount(event);
            }
            if (event.event === 'transfer.failed') {
                // response = await reverseTransferDebit(event);
                // response = 'transfer failed, please try again';
            }
            console.log(response);
            // sendSlackNotif(response);
        }
        catch (error) {
            // sendSlackNotif(error);
        }
    }
    res.sendStatus(200);
};
exports.webhookHandler = webhookHandler;
//# sourceMappingURL=paystackWebhook.js.map