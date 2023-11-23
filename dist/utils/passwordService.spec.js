"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const faker_1 = require("@faker-js/faker");
const jest_mock_1 = require("jest-mock");
const bcrypt_1 = __importDefault(require("bcrypt"));
const passwordService_1 = require("./passwordService");
jest.mock('bcrypt');
describe('passwordService', () => {
    describe('hashPassword', () => {
        it('should return hashed password', async () => {
            const password = faker_1.faker.internet.password();
            const hashedPassword = faker_1.faker.internet.password();
            (0, jest_mock_1.mocked)(bcrypt_1.default.hash).mockResolvedValueOnce(hashedPassword);
            await expect((0, passwordService_1.hashPassword)(password)).resolves.toBe(hashedPassword);
        });
    });
    describe('comparePasswords', () => {
        it('should return true when passwords match', async () => {
            const plainTextPassword = faker_1.faker.internet.password();
            const hashedPassword = faker_1.faker.internet.password();
            (0, jest_mock_1.mocked)(bcrypt_1.default.compare).mockResolvedValueOnce(true);
            await expect((0, passwordService_1.comparePasswords)(plainTextPassword, hashedPassword)).resolves.toBe(true);
        });
        it('should return false when passwords do not match', async () => {
            const plainTextPassword = faker_1.faker.internet.password();
            const hashedPassword = faker_1.faker.internet.password();
            (0, jest_mock_1.mocked)(bcrypt_1.default.compare).mockResolvedValueOnce(false);
            await expect((0, passwordService_1.comparePasswords)(plainTextPassword, hashedPassword)).resolves.toBe(false);
        });
    });
});
//# sourceMappingURL=passwordService.spec.js.map