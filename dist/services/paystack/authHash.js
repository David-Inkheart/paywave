"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const dotenv_1 = require("dotenv");
(0, dotenv_1.configDotenv)();
const secret = process.env.PAYSTACK_SECRET_KEY;
function hashedAuth(param) {
    const stringParam = JSON.stringify(param);
    const hash = crypto.createHmac('sha512', secret);
    hash.update(stringParam);
    return hash.digest('hex');
}
exports.default = hashedAuth;
//# sourceMappingURL=authHash.js.map