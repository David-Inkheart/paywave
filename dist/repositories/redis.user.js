"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteResetToken = exports.getResetToken = exports.storeResetToken = void 0;
const redisClient_1 = __importDefault(require("../redisClient"));
const storeResetToken = (key, value) => {
    return redisClient_1.default.setEx(key, 600, value);
};
exports.storeResetToken = storeResetToken;
const getResetToken = (key) => {
    return redisClient_1.default.get(key);
};
exports.getResetToken = getResetToken;
const deleteResetToken = (key) => {
    return redisClient_1.default.del(key);
};
exports.deleteResetToken = deleteResetToken;
//# sourceMappingURL=redis.user.js.map