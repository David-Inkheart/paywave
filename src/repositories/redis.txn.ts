import redisClient from '../redisClient';

export const storeTxnArgs = (key: string, value: string) => redisClient.setEx(key, 60, value);

export const getTxnArgs = (key: string) => redisClient.get(key);
