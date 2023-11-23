"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTxnArgs = exports.storeTxnArgs = void 0;
const redisClient_1 = __importDefault(require("../redisClient"));
const storeTxnArgs = (key, value) => redisClient_1.default.setEx(key, 30, value);
exports.storeTxnArgs = storeTxnArgs;
const getTxnArgs = (key) => redisClient_1.default.get(key);
exports.getTxnArgs = getTxnArgs;
//# sourceMappingURL=redis.txn.js.map