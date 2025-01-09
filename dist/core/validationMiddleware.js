"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationMiddleware = void 0;
const express_validator_1 = require("express-validator");
const validationMiddleware = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map((validation) => validation.run(req)));
        const errors = (0, express_validator_1.validationResult)(req);
        if (errors.isEmpty()) {
            return next();
        }
        const extractedErrors = {};
        errors.array().map((err) => {
            if (!extractedErrors[err.param]) {
                extractedErrors[err.param] = [];
            }
            extractedErrors[err.param].push(err.msg);
        });
        return res.status(400).json({
            message: 'Validation failed',
            errors: extractedErrors,
        });
    };
};
exports.validationMiddleware = validationMiddleware;
