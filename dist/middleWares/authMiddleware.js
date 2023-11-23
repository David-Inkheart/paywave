"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const error_handlers_1 = require("./error-handlers");
const authMiddleware = (req, res, next) => {
    try {
        let token;
        // check if token starts with Bearer
        if (req.headers.authorization && !req.headers.authorization.startsWith('Bearer')) {
            return res.status(401).json({
                success: false,
                error: "Authentication failed: token must start with 'Bearer'",
            });
        }
        // Get token from header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            // use array destructuring to get the token
            [, token] = req.headers.authorization.split(' ');
        }
        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Authentication failed: Token not provided',
            });
        }
        // Verify the token
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Attach the user ID to the request for further use
        req.userId = decodedToken.userId;
        return next();
    }
    catch (err) {
        if (err.name === 'JsonWebTokenError') {
            return (0, error_handlers_1.jwtErrorHandler)(err, req, res, next);
        }
        return next(err);
    }
};
exports.default = authMiddleware;
//# sourceMappingURL=authMiddleware.js.map