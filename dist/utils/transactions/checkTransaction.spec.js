"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const faker_1 = require("@faker-js/faker");
const jest_mock_1 = require("jest-mock");
const redis_txn_1 = require("../../repositories/redis.txn");
const checkTransaction_1 = __importDefault(require("./checkTransaction"));
jest.mock('../../repositories/redis.txn');
describe('checkTransaction', () => {
    const key = faker_1.faker.string.uuid();
    const hash = faker_1.faker.string.uuid();
    it('should return true if the hash is the same', async () => {
        (0, jest_mock_1.mocked)(redis_txn_1.getTxnArgs).mockResolvedValue(hash);
        const result = await (0, checkTransaction_1.default)(key, hash);
        expect(result).toBe(true);
    });
    it('should return false if the hash is different', async () => {
        (0, jest_mock_1.mocked)(redis_txn_1.getTxnArgs).mockResolvedValue(faker_1.faker.string.uuid());
        const result = await (0, checkTransaction_1.default)(key, hash);
        expect(result).toBe(false);
    });
    it('should store the hash if it is different', async () => {
        (0, jest_mock_1.mocked)(redis_txn_1.getTxnArgs).mockResolvedValue(faker_1.faker.string.uuid());
        await (0, checkTransaction_1.default)(key, hash);
        expect(redis_txn_1.storeTxnArgs).toHaveBeenCalledWith(key, hash);
    });
});
//# sourceMappingURL=checkTransaction.spec.js.map