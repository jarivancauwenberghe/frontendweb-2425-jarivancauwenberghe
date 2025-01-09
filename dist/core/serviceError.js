"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceError = void 0;
class ServiceError extends Error {
    constructor(message, statusCode, details) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
    }
    static validationFailed(message, details) {
        return new ServiceError(message, 422, details);
    }
    static notFound(message) {
        return new ServiceError(message, 404);
    }
    static forbidden(message) {
        return new ServiceError(message, 403);
    }
    static internalError(message) {
        return new ServiceError(message, 500);
    }
    static handleError(err, res) {
        if (err instanceof ServiceError) {
            return res.status(err.statusCode).json({ message: err.message, details: err.details });
        }
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
exports.ServiceError = ServiceError;
