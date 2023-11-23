"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_txn_1 = require("../../repositories/redis.txn");
async function isDuplicateTxn(key, hash) {
    const result = await (0, redis_txn_1.getTxnArgs)(key);
    if (result === hash) {
        return true;
    }
    (0, redis_txn_1.storeTxnArgs)(key, hash);
    return false;
}
exports.default = isDuplicateTxn;
//# sourceMappingURL=checkTransaction.js.map