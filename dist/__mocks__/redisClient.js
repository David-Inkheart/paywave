"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_mock_1 = __importDefault(require("redis-mock"));
const jest_mock_extended_1 = require("jest-mock-extended");
const newClient = redis_mock_1.default.createClient();
const client = (0, jest_mock_extended_1.mockDeep)();
exports.default = client;
//# sourceMappingURL=redisClient.js.map