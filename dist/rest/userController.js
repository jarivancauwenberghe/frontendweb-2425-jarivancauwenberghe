"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const userService_1 = require("../services/userService");
const serviceError_1 = require("../core/serviceError");
const validationMiddleware_1 = require("../core/validationMiddleware");
const express_validator_1 = require("express-validator");
class UserController {
    static async getUsers(req, res) {
        try {
            const users = await userService_1.UserService.getAllUsers();
            res.status(200).json(users);
        }
        catch (err) {
            serviceError_1.ServiceError.handleError(err, res);
        }
    }
    static async getUserById(req, res) {
        try {
            const user = await userService_1.UserService.getUserById(req.params.id);
            res.status(200).json(user);
        }
        catch (err) {
            serviceError_1.ServiceError.handleError(err, res);
        }
    }
    static async createUser(req, res) {
        (0, validationMiddleware_1.validationMiddleware)([
            (0, express_validator_1.body)('username').notEmpty().withMessage('Username is required'),
            (0, express_validator_1.body)('password')
                .notEmpty().withMessage('Password is required')
                .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
                .matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/).withMessage('Password must contain uppercase, lowercase, number, and special character')
        ])(req, res, async () => {
            try {
                const user = await userService_1.UserService.createUser(req.body);
                res.status(201).json(user);
            }
            catch (err) {
                serviceError_1.ServiceError.handleError(err, res);
            }
        });
    }
    static async updateUserById(req, res) {
        (0, validationMiddleware_1.validationMiddleware)([
            (0, express_validator_1.body)('username').optional().notEmpty().withMessage('Username is required'),
            (0, express_validator_1.body)('password').optional()
                .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
                .matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/).withMessage('Password must contain uppercase, lowercase, number, and special character')
        ])(req, res, async () => {
            try {
                const user = await userService_1.UserService.updateUserById(req.params.id, req.body);
                res.status(200).json(user);
            }
            catch (err) {
                serviceError_1.ServiceError.handleError(err, res);
            }
        });
    }
    static async deleteUserById(req, res) {
        try {
            await userService_1.UserService.deleteUserById(req.params.id);
            res.status(204).send();
        }
        catch (err) {
            serviceError_1.ServiceError.handleError(err, res);
        }
    }
}
exports.UserController = UserController;
