"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtErrorHandler = void 0;
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
//# sourceMappingURL=error-handlers.js.map