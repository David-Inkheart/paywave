import { Request, Response, NextFunction } from 'express';
import { jwtErrorHandler } from './error-handlers';

describe('jwtErrorHandler', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock<NextFunction>;

  beforeEach(() => {
    mockRequest = {};
    mockNext = jest.fn();

    // Initialize mockResponse with the necessary functions
    mockResponse = {
      status: jest.fn(() => mockResponse),
      json: jest.fn(),
    } as Partial<Response>;
  });

  it('should return a 401 for JsonWebTokenError', () => {
    const mockError = new Error('JsonWebTokenError');
    mockError.name = 'JsonWebTokenError';

    jwtErrorHandler(mockError, mockRequest as Request, mockResponse as Response, mockNext);

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

    jwtErrorHandler(mockError, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: 'Authentication failed: Token expired',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should call next for other errors', () => {
    const mockError = new Error('Some other error');

    jwtErrorHandler(mockError, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(mockError);
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });
});
