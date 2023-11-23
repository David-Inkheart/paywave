"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const dotenv_1 = require("dotenv");
(0, dotenv_1.configDotenv)();
const key = process.env.HASH_SECRET;
function hashArguments(...parameters) {
    const concatenatedRequest = parameters.join('');
    const hash = crypto.createHmac('sha512', key);
    hash.update(concatenatedRequest);
    return hash.digest('hex');
}
exports.default = hashArguments;
//# sourceMappingURL=hash.js.map