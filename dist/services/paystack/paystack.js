"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveAccount = exports.transferStatus = exports.transferInit = exports.deleteTransferRecipient = exports.createTransferRecipient = exports.listBanks = exports.verifyPay = exports.initPay = void 0;
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
const dotenv_1 = require("dotenv");
// import { sendSlackNotif } from '../slack/slackNotifs';
(0, dotenv_1.configDotenv)();
const config = {
    headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
    },
};
const baseUrl = `${process.env.PAYSTACK_BASE_URL}`;
const paystackClient = axios_1.default.create({ baseURL: baseUrl, headers: config.headers });
paystackClient.interceptors.response.use((response) => {
    return response.data;
}, (error) => {
    console.log(error.response);
    // sendSlackNotif(error.response.data);
    if (error.response.status >= 400 && error.response.status <= 499) {
        console.log(error.response);
        // sendSlackNotif(error.response);
        return {
            success: false,
            message: 'Bad request: you probably sent an invalid request',
        };
    }
    throw new Error('Internal server error');
});
const initPay = async (data) => {
    const reference = (0, uuid_1.v4)();
    return paystackClient.post('/transaction/initialize', { reference, ...data });
};
exports.initPay = initPay;
const verifyPay = async (reference) => paystackClient.get(`/transaction/verify/${reference}`);
exports.verifyPay = verifyPay;
const listBanks = async () => paystackClient.get('/bank');
exports.listBanks = listBanks;
const createTransferRecipient = async ({ name, bankCode, accountNumber }) => {
    const data = {
        type: 'nuban',
        name,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: 'NGN',
    };
    return paystackClient.post('/transferrecipient', data);
};
exports.createTransferRecipient = createTransferRecipient;
const deleteTransferRecipient = async (recipientCode) => paystackClient.delete(`/transferrecipient/${recipientCode}`);
exports.deleteTransferRecipient = deleteTransferRecipient;
const transferInit = async ({ amount, recipient, reference, reason, }) => {
    const data = {
        source: 'balance',
        amount,
        recipient,
        reason,
        reference,
    };
    return paystackClient.post('/transfer', data);
};
exports.transferInit = transferInit;
// export const transferFinalize = async (transferCode: string) => paystackClient.post('/transfer/finalize_transfer', transferCode);
const transferStatus = async (transferCode) => paystackClient.get(`/transfer/${transferCode}`);
exports.transferStatus = transferStatus;
const resolveAccount = async (accountNumber, bankCode) => paystackClient.get(`/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`);
exports.resolveAccount = resolveAccount;
//# sourceMappingURL=paystack.js.map