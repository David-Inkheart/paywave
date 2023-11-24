"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_account_1 = require("../repositories/db.account");
const db_customer_1 = require("../repositories/db.customer");
const validators_1 = require("../utils/validators");
class CustomerController {
    static async createCustomer({ userId, customerName, customerEmail }) {
        try {
            const { error } = validators_1.customerDetailSchema.validate({ customerName, customerEmail });
            if (error) {
                return {
                    success: false,
                    error: error.message,
                };
            }
            const businessAccount = await (0, db_account_1.findbusinessAccount)({ userId });
            if (!businessAccount) {
                return {
                    success: false,
                    error: 'business account does not exist',
                };
            }
            await (0, db_customer_1.createCustomer)({
                name: customerName,
                email: customerEmail,
                businessAccount: {
                    connect: {
                        id: businessAccount.id,
                    },
                },
            });
            return {
                success: true,
                message: 'Customer created successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Could not create customer',
            };
        }
    }
    static async updateCustomer({ customerName, customerEmail }) {
        try {
            const { error } = validators_1.customerDetailSchema.validate({ customerName, customerEmail });
            if (error) {
                return {
                    success: false,
                    error: error.message,
                };
            }
            const customer = await (0, db_customer_1.findCustomer)({ email: customerEmail });
            if (!customer) {
                return {
                    success: false,
                    error: 'Customer does not exist',
                };
            }
            await (0, db_customer_1.updateCustomer)({ email: customerEmail }, { name: customerName });
            return {
                success: true,
                message: 'Customer details updated successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Could not update customer',
            };
        }
    }
    static async deleteCustomer(customerEmail) {
        try {
            const { error } = validators_1.customerEmailSchema.validate({ customerEmail });
            if (error) {
                return {
                    success: false,
                    error: error.message,
                };
            }
            const customer = await (0, db_customer_1.findCustomer)({ email: customerEmail });
            if (!customer) {
                return {
                    success: false,
                    error: 'Customer does not exist',
                };
            }
            await (0, db_customer_1.deleteCustomer)({ email: customerEmail });
            return {
                success: true,
                message: 'Customer deleted successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Could not delete customer',
            };
        }
    }
    static async getCustomer(customerEmail) {
        try {
            const { error } = validators_1.customerEmailSchema.validate({ customerEmail });
            if (error) {
                return {
                    success: false,
                    error: error.message,
                };
            }
            const customer = await (0, db_customer_1.findCustomer)({ email: customerEmail });
            if (!customer) {
                return {
                    success: false,
                    error: 'Customer does not exist',
                };
            }
            return {
                success: true,
                data: customer,
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Could not fetch customer',
            };
        }
    }
    static async getCustomers(userId) {
        try {
            const businessAccount = await (0, db_account_1.findbusinessAccount)({ userId });
            if (!businessAccount) {
                return {
                    success: false,
                    error: 'business account does not exist',
                };
            }
            const customers = await (0, db_customer_1.getBusinessCustomers)(businessAccount.id);
            return {
                success: true,
                data: customers,
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Could not fetch customers',
            };
        }
    }
}
exports.default = CustomerController;
//# sourceMappingURL=Customercontrollers.js.map