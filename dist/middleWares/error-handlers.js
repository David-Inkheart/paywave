"use strict";
// custom error handler that returns a JSON response
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtErrorHandler = exports.errorHandler = exports.CustomError = void 0;
class CustomError extends Error {
    statusCode;
    data;
    constructor(message, statusCode, data) {
        super(message);
        this.statusCode = statusCode;
        this.data = data;
    }
}
exports.CustomError = CustomError;
// jwt error handler
const jwtErrorHandler = (err, req, res, next) => {
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
exports.jwtErrorHandler = jwtErrorHandler;
// how to use the error handler
// import { errorHandler } from './utils/error-handlers';
// app.use(errorHandler);
const errorHandler = (err, req, res, next) => {
    const { statusCode, message, data } = err;
    res.status(statusCode).json({
        success: false,
        message,
        data,
    });
    return next();
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=error-handlers.js.map