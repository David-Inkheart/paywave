"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoice = void 0;
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
//# sourceMappingURL=db.invoice.js.map