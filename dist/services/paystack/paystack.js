"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveAccount = exports.verifyPay = exports.initPay = void 0;
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
const dotenv_1 = require("dotenv");
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
    if (error.response.status >= 400 && error.response.status <= 499) {
        console.log(error.response);
        return {
            success: error.response.data.status,
            message: error.response.data.message,
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
const resolveAccount = async (accountNumber, bankCode) => paystackClient.get(`/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`);
exports.resolveAccount = resolveAccount;
//# sourceMappingURL=paystack.js.map