"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmResetPasswordHandler = exports.resetPasswordHandler = exports.changePasswordHandler = exports.registerHandler = exports.loginHandler = void 0;
const Authcontroller_1 = __importDefault(require("../../controllers/Authcontroller"));
const Passwordcontroller_1 = __importDefault(require("../../controllers/Passwordcontroller"));
const loginHandler = async (req, res) => {
    try {
        const { email, password } = req.body;
        const response = await Authcontroller_1.default.login({ email, password });
        if (!response.success) {
            if (response.error?.includes('mismatch')) {
                return res.status(401).json({
                    success: false,
                    error: response.error,
                });
            }
            return res.status(400).json({
                success: false,
                error: response.error,
            });
        }
        return res.json({
            success: response.success,
            message: 'Login successful',
            data: { token: response.token },
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};
exports.loginHandler = loginHandler;
const registerHandler = async (req, res) => {
    try {
        const { firstName, lastName, businessName, phoneNumber, email, password } = req.body;
        const response = await Authcontroller_1.default.register({ firstName, lastName, businessName, phoneNumber, email, password });
        if (!response.success) {
            if (response.error?.includes('already exists')) {
                return res.status(409).json({
                    success: false,
                    error: response.error,
                });
            }
            return res.status(400).json({
                success: false,
                error: response.error,
            });
        }
        return res.json({
            success: response.success,
            message: 'User registered successfully',
            data: { token: response.token },
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};
exports.registerHandler = registerHandler;
const changePasswordHandler = async (req, res) => {
    try {
        const userId = req.userId;
        const { currentPassword, newPassword } = req.body;
        const response = await Passwordcontroller_1.default.changePassword({
            userId,
            currentPassword,
            newPassword,
        });
        if (!response.success) {
            if (response.error?.includes('incorrect')) {
                return res.status(401).json({
                    success: false,
                    error: response.error,
                });
            }
            return res.status(400).json({
                success: false,
                error: response.error,
            });
        }
        return res.json({
            success: response.success,
            message: response.message,
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};
exports.changePasswordHandler = changePasswordHandler;
const resetPasswordHandler = async (req, res) => {
    try {
        const { email } = req.body;
        const response = await Passwordcontroller_1.default.resetPassword(email);
        if (!response.success) {
            if (response.error?.includes('not found')) {
                return res.status(404).json({
                    success: false,
                    error: response.error,
                });
            }
            return res.status(400).json({
                success: false,
                error: response.error,
            });
        }
        return res.json({
            success: response.success,
            message: response.message,
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};
exports.resetPasswordHandler = resetPasswordHandler;
const confirmResetPasswordHandler = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;
        const response = await Passwordcontroller_1.default.confirmResetPassword(email, code, newPassword);
        if (!response.success) {
            if (response.error?.includes('not found')) {
                return res.status(404).json({
                    success: false,
                    error: response.error,
                });
            }
            return res.status(400).json({
                success: false,
                error: response.error,
            });
        }
        return res.json({
            success: response.success,
            message: response.message,
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};
exports.confirmResetPasswordHandler = confirmResetPasswordHandler;
//# sourceMappingURL=auth.js.map