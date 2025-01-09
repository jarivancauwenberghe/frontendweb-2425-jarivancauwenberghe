"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const logger_1 = __importDefault(require("./logger"));
const serviceError_1 = require("./serviceError");
const errorMiddleware = (err, req, res, next) => {
    if (err instanceof serviceError_1.ServiceError) {
        logger_1.default.warn(`${err.statusCode} - ${err.message}`);
    }
    else if (err.name === 'ValidationError') {
        logger_1.default.warn(`400 - Validation Error: ${err.message}`, { details: err.details });
    }
    else {
        logger_1.default.error(`500 - ${err.message}`, { stack: err.stack });
    }
    res.status(err.statusCode || 500).json({
        message: err.message || 'Internal Server Error',
        details: err.details || undefined
    });
};
exports.errorMiddleware = errorMiddleware;
