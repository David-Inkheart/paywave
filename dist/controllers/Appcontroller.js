"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AppController {
    static getHome() {
        return {
            success: true,
            message: 'API is online, welcome!',
            data: {
                name: 'paywave',
                purpose: 'Simplifying Small Business Payments',
                API: 'REST',
                version: '1.0.0',
                API_docs: 'update',
            },
        };
    }
}
exports.default = AppController;
//# sourceMappingURL=Appcontroller.js.map