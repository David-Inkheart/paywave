"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBusinessCustomers = exports.deleteCustomer = exports.updateCustomer = exports.findCustomer = exports.createCustomer = void 0;
const db_server_1 = __importDefault(require("../utils/db.server"));
const createCustomer = (data) => {
    return db_server_1.default.customer.create({ data });
};
exports.createCustomer = createCustomer;
const findCustomer = (data) => {
    return db_server_1.default.customer.findFirst({ where: data });
};
exports.findCustomer = findCustomer;
const updateCustomer = (id, data) => {
    return db_server_1.default.customer.update({
        where: id,
        data,
    });
};
exports.updateCustomer = updateCustomer;
const deleteCustomer = (id) => {
    return db_server_1.default.customer.delete({ where: id });
};
exports.deleteCustomer = deleteCustomer;
const getBusinessCustomers = (businessAccountId) => {
    return db_server_1.default.customer.findMany({ where: { businessAccountId } });
};
exports.getBusinessCustomers = getBusinessCustomers;
//# sourceMappingURL=db.customer.js.map