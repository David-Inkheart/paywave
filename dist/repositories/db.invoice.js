"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInvoice = exports.getAllInvoices = exports.findInvoice = exports.getInvoice = exports.createInvoice = void 0;
const db_server_1 = __importDefault(require("../utils/db.server"));
const createInvoice = ({ businessAccountId, customerId, totalAmount, paymentDueDate, items, }) => {
    return db_server_1.default.invoice.create({
        data: {
            businessAccountId,
            customerId,
            totalAmount,
            paymentDueDate,
            items: {
                createMany: {
                    data: items.map((item) => ({
                        ...item,
                    })),
                },
            },
        },
    });
};
exports.createInvoice = createInvoice;
const getInvoice = (id) => {
    return db_server_1.default.invoice.findUnique({
        where: { id },
        include: { items: true },
    });
};
exports.getInvoice = getInvoice;
const findInvoice = (data) => {
    return db_server_1.default.invoice.findFirst({ where: data });
};
exports.findInvoice = findInvoice;
const getAllInvoices = (businessAccountId) => {
    return db_server_1.default.invoice.findMany({
        where: { businessAccountId },
        include: { items: true },
    });
};
exports.getAllInvoices = getAllInvoices;
const updateInvoice = async ({ customerId, invoiceId, businessAccountId, paymentStatus, reference, totalAmount, txn }) => {
    return txn
        ? txn.invoice.updateMany({
            where: {
                customerId,
                id: invoiceId,
                businessAccountId,
                totalAmount,
            },
            data: {
                paymentStatus,
                reference,
            },
        })
        : db_server_1.default.invoice.updateMany({
            where: {
                id: invoiceId,
                customerId,
                businessAccountId,
                reference,
                totalAmount,
            },
            data: {
                paymentStatus,
                reference,
            },
        });
};
exports.updateInvoice = updateInvoice;
//# sourceMappingURL=db.invoice.js.map