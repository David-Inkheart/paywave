import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import authMiddleware from './authMiddleware';

jest.mock('jsonwebtoken');
jest.mock('./error-handlers');

describe('authMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock<NextFunction>;

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
    mockRequest.headers!.authorization = 'InvalidToken';

    authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: "Authentication failed: token must start with 'Bearer'",
    });
    expect(mockRequest.userId).toBeUndefined();
  });

  it('should return 401 if token is not provided', () => {
    authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

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
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    // Wrapped in a try/catch block to handle the asynchronous error
    try {
      await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
    } catch (err) {
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
    (jwt.verify as jest.Mock).mockReturnValue({ userId: 'mockUserId' });

    mockRequest.headers!.authorization = 'Bearer ValidToken';

    authMiddleware(mockRequest as Request, {} as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRequest.userId).toBe('mockUserId');
    expect(jwt.verify).toHaveBeenCalledWith('ValidToken', process.env.JWT_SECRET!);
  });
});
