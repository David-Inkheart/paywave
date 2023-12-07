"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_handlers_1 = require("./error-handlers");
describe('jwtErrorHandler', () => {
    let mockRequest;
    let mockResponse;
    let mockNext;
    beforeEach(() => {
        mockRequest = {};
        mockNext = jest.fn();
        // Initialize mockResponse with the necessary functions
        mockResponse = {
            status: jest.fn(() => mockResponse),
            json: jest.fn(),
        };
    });
    it('should return a 401 for JsonWebTokenError', () => {
        const mockError = new Error('JsonWebTokenError');
        mockError.name = 'JsonWebTokenError';
        (0, error_handlers_1.jwtErrorHandler)(mockError, mockRequest, mockResponse, mockNext);
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: false,
            error: 'Authentication failed: Invalid token',
        });
        expect(mockNext).not.toHaveBeenCalled();
    });
    it('should return a 401 for TokenExpiredError', () => {
        const mockError = new Error('TokenExpiredError');
        mockError.name = 'TokenExpiredError';
        (0, error_handlers_1.jwtErrorHandler)(mockError, mockRequest, mockResponse, mockNext);
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: false,
            error: 'Authentication failed: Token expired',
        });
        expect(mockNext).not.toHaveBeenCalled();
    });
    it('should call next for other errors', () => {
        const mockError = new Error('Some other error');
        (0, error_handlers_1.jwtErrorHandler)(mockError, mockRequest, mockResponse, mockNext);
        expect(mockNext).toHaveBeenCalledWith(mockError);
        expect(mockResponse.status).not.toHaveBeenCalled();
        expect(mockResponse.json).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=error-handlers.spec.js.map