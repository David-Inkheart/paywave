"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Appcontroller_1 = __importDefault(require("./Appcontroller"));
describe('AppController', () => {
    describe('getHome', () => {
        it('should return a welcome message', () => {
            const result = Appcontroller_1.default.getHome();
            expect(result).toEqual({
                success: true,
                message: 'API is online, welcome!',
                data: {
                    name: expect.any(String),
                    purpose: expect.any(String),
                    API: 'REST',
                    version: expect.any(String),
                    API_docs: expect.stringContaining('https:'),
                },
            });
        });
    });
});
//# sourceMappingURL=Appcontroller.spec.js.map