"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findTransaction = exports.getTransactions = exports.recordTransaction = void 0;
const date_fns_1 = require("date-fns");
const db_server_1 = __importDefault(require("../utils/db.server"));
const recordTransaction = async ({ amount, transactionType, businessAccountId, invoiceId, customerId, reference, metadata }, txn) => {
    const createData = {
        customerId,
        invoiceId,
        amount,
        transactionType,
        reference,
        businessAccountId,
        metadata,
    };
    return txn ? txn.transaction.create({ data: createData }) : db_server_1.default.transaction.create({ data: createData });
};
exports.recordTransaction = recordTransaction;
const getTransactions = async ({ userId, limit = 10, page = 1, from, to, transactionType }) => {
    const businessAccount = await db_server_1.default.businessAccount.findFirst({ where: { userId } });
    const StartDate = from ? (0, date_fns_1.startOfDay)(new Date(from)) : undefined;
    const EndDate = to ? (0, date_fns_1.endOfDay)(new Date(to)) : undefined;
    const [totalRecords, transactions] = await db_server_1.default.$transaction([
        db_server_1.default.transaction.count({
            where: {
                businessAccountId: businessAccount.id,
                createdAt: {
                    ...(from && { gte: StartDate }),
                    ...(to && { lte: EndDate }),
                },
                transactionType,
            },
        }),
        db_server_1.default.transaction.findMany({
            take: limit,
            skip: (page - 1) * limit,
            orderBy: {
                createdAt: 'desc',
            },
            where: {
                businessAccountId: businessAccount.id,
                createdAt: {
                    ...(from && { gte: StartDate }),
                    ...(to && { lte: EndDate }),
                },
                transactionType,
            },
        }),
    ]);
    return {
        totalRecords,
        transactions,
    };
};
exports.getTransactions = getTransactions;
const findTransaction = async (data) => {
    return db_server_1.default.transaction.findFirst({ where: data });
};
exports.findTransaction = findTransaction;
//# sourceMappingURL=db.transactions.js.map