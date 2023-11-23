"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const dotenv_1 = require("dotenv");
(0, dotenv_1.configDotenv)();
const redisClient = (0, redis_1.createClient)({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT, 10),
    },
});
redisClient.on('connect', () => {
    // eslint-disable-next-line no-console
    console.log('Redis client connected');
});
redisClient.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.log(`Something went wrong ${err}`);
});
(async () => {
    await redisClient.connect();
})();
exports.default = redisClient;
//# sourceMappingURL=redisClient.js.map