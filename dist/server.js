"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const index_1 = __importDefault(require("./routes/index"));
const error_handlers_1 = require("./middleWares/error-handlers");
const app = (0, express_1.default)();
const Port = process.env.PORT || 3000;
// middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// ... REST API routes will go here
app.use('/', index_1.default);
// Not found route
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Resource not found',
    });
});
// Error Handling to catch any unhandled error during req processing
app.use((err, req, res, next) => {
    if (err.name === 'JsonWebTokenError') {
        return (0, error_handlers_1.jwtErrorHandler)(err, req, res, next);
    }
    if (err.name === 'TokenExpiredError') {
        return (0, error_handlers_1.jwtErrorHandler)(err, req, res, next);
    }
    console.error(err.stack);
    return res.status(500).json({
        success: false,
        message: 'There was a problem processing your request, please try again later',
        // error: err.message,
    });
});
app.listen(Port, () => {
    // eslint-disable-next-line no-console
    console.log(`REST API server is running on http://localhost:${Port}`);
});
exports.default = app;
//# sourceMappingURL=server.js.map