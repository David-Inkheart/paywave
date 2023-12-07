"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware_1 = __importDefault(require("./authMiddleware"));
jest.mock('jsonwebtoken');
jest.mock('./error-handlers');
describe('authMiddleware', () => {
    let mockRequest;
    let mockResponse;
    let mockNext;
    beforeEach(() => {
        mockRequest = {
            headers: {},
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        mockNext = jest.fn();
    });
    it('should return 401 if token does not start with Bearer', () => {
        mockRequest.headers.authorization = 'InvalidToken';
        (0, authMiddleware_1.default)(mockRequest, mockResponse, mockNext);
        expect(mockNext).not.toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: false,
            error: "Authentication failed: token must start with 'Bearer'",
        });
        expect(mockRequest.userId).toBeUndefined();
    });
    it('should return 401 if token is not provided', () => {
        (0, authMiddleware_1.default)(mockRequest, mockResponse, mockNext);
        expect(mockNext).not.toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: false,
            error: 'Authentication failed: Token not provided',
        });
        expect(mockRequest.userId).toBeUndefined();
    });
    it('should return 401 if token is not valid', async () => {
        // Mocking jwt.verify to throw an error (simulating an invalid token)
        jsonwebtoken_1.default.verify.mockImplementation(() => {
            throw new Error('Invalid token');
        });
        // Wrapped in a try/catch block to handle the asynchronous error
        try {
            await (0, authMiddleware_1.default)(mockRequest, mockResponse, mockNext);
        }
        catch (err) {
            expect(mockNext).not.toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                error: 'Authentication failed: Invalid token',
            });
            expect(mockRequest.userId).toBeUndefined();
        }
    });
    it('should attach userId to request and call next on successful verification', () => {
        jsonwebtoken_1.default.verify.mockReturnValue({ userId: 'mockUserId' });
        mockRequest.headers.authorization = 'Bearer ValidToken';
        (0, authMiddleware_1.default)(mockRequest, {}, mockNext);
        expect(mockNext).toHaveBeenCalled();
        expect(mockRequest.userId).toBe('mockUserId');
        expect(jsonwebtoken_1.default.verify).toHaveBeenCalledWith('ValidToken', process.env.JWT_SECRET);
    });
});
//# sourceMappingURL=authMiddleware.spec.js.map