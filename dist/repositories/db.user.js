"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.createUser = exports.findUserByEmailOrPhone = exports.findUser = void 0;
const db_server_1 = __importDefault(require("../utils/db.server"));
const findUser = (data) => {
    return db_server_1.default.user.findUnique({ where: data });
};
exports.findUser = findUser;
// find user with email or phone number, both are unique
const findUserByEmailOrPhone = (data) => {
    return db_server_1.default.user.findFirst({ where: data });
};
exports.findUserByEmailOrPhone = findUserByEmailOrPhone;
// create user with an account
const createUser = (data, businessName) => {
    return db_server_1.default.user.create({
        data: {
            ...data,
            businessAccounts: {
                create: {
                    businessName,
                },
            },
        },
    });
};
exports.createUser = createUser;
const updateUser = (id, data) => {
    return db_server_1.default.user.update({ where: { id }, data });
};
exports.updateUser = updateUser;
//# sourceMappingURL=db.user.js.map