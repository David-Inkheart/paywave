import { Request, Response, NextFunction } from 'express';

// jwt error handler
const jwtErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Authentication failed: Invalid token',
    });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Authentication failed: Token expired',
    });
  }
  return next(err);
};

export { jwtErrorHandler };
