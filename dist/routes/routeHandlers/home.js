"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHomeHandler = void 0;
const Appcontroller_1 = __importDefault(require("../../controllers/Appcontroller"));
const getHomeHandler = async (_, res) => {
    try {
        const response = await Appcontroller_1.default.getHome();
        return res.json({
            success: response.success,
            message: response.message,
            data: response.data,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};
exports.getHomeHandler = getHomeHandler;
//# sourceMappingURL=home.js.map