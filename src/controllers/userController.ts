import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService';
import { AppDataSource } from '../data/data-source';
import { User } from '../entity/user';
import { validationResult } from 'express-validator';
import { ServiceError } from '../core/serviceError';
import { CreateUserDTO } from '../dto/createUserDTO';

export class UserController {
    private userService: UserService;

    constructor() {
        const userRepo = AppDataSource.getRepository(User);
        this.userService = new UserService(userRepo);
    }

    /**
     * Get all users.
     * Tests:
     * - Authorization: Must be admin (403 if not).
     * - Successful fetch (200).
     * - Mock repo error (500).
     */
    async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const users = await this.userService.getAllUsers();
            res.json({ success: true, data: users });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get a user by ID.
     * Tests:
     * - Authorization: admin role required.
     * - Invalid ID (400).
     * - Non-existent user (404).
     * - Success (200).
     */
    async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ServiceError('Validation failed', 400, errors.array()));
        }

        try {
            const user = await this.userService.getUserById(req.params.id);
            res.json({ success: true, data: user });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create a new user.
     * Tests:
     * - Authorization: admin only.
     * - Missing username/password (400).
     * - Duplicate username (400).
     * - Success (201).
     */
    async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ServiceError('Validation failed', 400, errors.array()));
        }

        try {
            const dto: CreateUserDTO = {
                username: req.body.username,
                password: req.body.password,
                role: req.body.role,
            };
            const user = await this.userService.createUser(dto);
            res.status(201).json({ success: true, data: user });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update a user by ID.
     * Tests:
     * - Authorization: admin only.
     * - Invalid ID (400).
     * - Non-existent user (404).
     * - Duplicate username (400).
     * - Success (200).
     */
    async updateUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ServiceError('Validation failed', 400, errors.array()));
        }

        try {
            const { username, password, role } = req.body;
            const updateData: Partial<User> = {};
            if (username !== undefined) updateData.username = username;
            if (password !== undefined) updateData.password = password;
            if (role !== undefined) updateData.userRoles = [role];

            const user = await this.userService.updateUserById(req.params.id, updateData);
            res.json({ success: true, data: user });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete a user by ID.
     * Tests:
     * - Authorization: admin only.
     * - Invalid ID (400).
     * - Non-existent user (404).
     * - Success (200).
     */
    async deleteUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ServiceError('Validation failed', 400, errors.array()));
        }

        try {
            const result = await this.userService.deleteUserById(req.params.id);
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}
