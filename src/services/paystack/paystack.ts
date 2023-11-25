import axios from 'axios';
import { v4 as uuid } from 'uuid';
import { configDotenv } from 'dotenv';
import { fundingParams } from '../../types/custom';

configDotenv();

const config = {
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
};

const baseUrl = `${process.env.PAYSTACK_BASE_URL}`;

const paystackClient = axios.create({ baseURL: baseUrl, headers: config.headers });

paystackClient.interceptors.response.use(
  (response) => {
    return response.data;
  },

  (error) => {
    console.log(error.response);
    if (error.response.status >= 400 && error.response.status <= 499) {
      console.log(error.response);
      return {
        success: false,
        message: 'Bad request: you probably sent an invalid request',
      };
    }
    throw new Error('Internal server error');
  },
);

export const initPay = async (data: fundingParams) => {
  const reference = uuid();
  return paystackClient.post('/transaction/initialize', { reference, ...data });
};

export const verifyPay = async (reference: string) => paystackClient.get(`/transaction/verify/${reference}`);

export const resolveAccount = async (accountNumber: string, bankCode: string) =>
  paystackClient.get(`/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`);
