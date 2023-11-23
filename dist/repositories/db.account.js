"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.creditbusinessAccount = exports.debitbusinessAccount = exports.findbusinessAccountbyUserId = exports.findbusinessAccount = void 0;
const client_1 = require("@prisma/client");
const db_server_1 = __importDefault(require("../utils/db.server"));
const findbusinessAccount = (data) => {
    return db_server_1.default.businessAccount.findFirst({ where: data });
};
exports.findbusinessAccount = findbusinessAccount;
const findbusinessAccountbyUserId = (userId, txn) => {
    return txn
        ? txn.$queryRaw(client_1.Prisma.sql `SELECT * FROM "public"."businessAccount" WHERE "userId" = ${userId} FOR UPDATE;`)
        : db_server_1.default.$queryRaw(client_1.Prisma.sql `SELECT * FROM "public"."businessAccount" WHERE "userId" = ${userId} FOR UPDATE;`);
};
exports.findbusinessAccountbyUserId = findbusinessAccountbyUserId;
const debitbusinessAccount = ({ amount, businessAccountId, txn, }) => txn
    ? txn.businessAccount.update({
        where: { id: businessAccountId },
        data: {
            balance: {
                decrement: amount,
            },
        },
        select: { balance: true },
    })
    : db_server_1.default.businessAccount.update({
        where: { id: businessAccountId },
        data: {
            balance: {
                decrement: amount,
            },
        },
        select: { balance: true },
    });
exports.debitbusinessAccount = debitbusinessAccount;
const creditbusinessAccount = ({ amount, businessAccountId, txn, }) => txn
    ? txn.businessAccount.update({
        where: { id: businessAccountId },
        data: {
            balance: {
                increment: amount,
            },
        },
        select: { balance: true },
    })
    : db_server_1.default.businessAccount.update({
        where: { id: businessAccountId },
        data: {
            balance: {
                increment: amount,
            },
        },
        select: { balance: true },
    });
exports.creditbusinessAccount = creditbusinessAccount;
// export const getSubType = (name: string) => prisma.transactionSubType.findFirst({ where: { name } });
//# sourceMappingURL=db.account.js.map