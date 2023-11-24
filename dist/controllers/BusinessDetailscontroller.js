"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_account_1 = require("../repositories/db.account");
const db_user_1 = require("../repositories/db.user");
const validators_1 = require("../utils/validators");
class BusinessDetailsController {
    static async getBusinessDetails(userId) {
        try {
            const [userDetails, businessAcc] = await Promise.all([(0, db_user_1.findUser)({ id: userId }), (0, db_account_1.findbusinessAccount)({ id: userId })]);
            if (!userDetails || !businessAcc) {
                return {
                    success: false,
                    error: 'business account does not exist',
                };
            }
            const businessDetails = {
                ...businessAcc,
                email: userDetails.email,
                phoneNumber: userDetails.phoneNumber,
            };
            return {
                success: true,
                data: businessDetails,
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Could not get business details',
            };
        }
    }
    static async updateBusinessDetails({ userId, streetAddress, city, businessName, country, }) {
        try {
            const { error } = validators_1.businessDetailsSchema.validate({ streetAddress, city, businessName, country });
            if (error) {
                return {
                    success: false,
                    error: error.message,
                };
            }
            const businessAcc = await (0, db_account_1.findbusinessAccount)({ id: userId });
            if (!businessAcc) {
                return {
                    success: false,
                    error: 'business account does not exist',
                };
            }
            await (0, db_account_1.updatebusinessAccount)(businessAcc.id, { streetAddress, city, businessName, country });
            return {
                success: true,
                message: 'business details updated successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Could not update business details',
            };
        }
    }
    static async updatePaymentDetails({ userId, bankCode, accountNumber, accountName, }) {
        try {
            const { error } = validators_1.paymentDetailsSchema.validate({ bankCode, accountNumber, accountName });
            if (error) {
                return {
                    success: false,
                    error: error.message,
                };
            }
            const businessAcc = await (0, db_account_1.findbusinessAccount)({ id: userId });
            if (!businessAcc) {
                return {
                    success: false,
                    error: 'business account does not exist',
                };
            }
            await (0, db_account_1.updatebusinessAccount)(businessAcc.id, { bankCode, accountNumber, accountName });
            return {
                success: true,
                message: 'Payment details updated successfully',
            };
        }
        catch (error) {
            console.log(error);
            return {
                success: false,
                error: 'Could not update payment details, please try again later',
            };
        }
    }
}
exports.default = BusinessDetailsController;
//# sourceMappingURL=BusinessDetailscontroller.js.map