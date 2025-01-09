import { Repository } from 'typeorm';
import { User } from '../entity/user';
import { ServiceError } from '../core/serviceError';
import logger from '../core/logger';
import { CreateUserDTO } from '../dto/createUserDTO';
import bcrypt from 'bcrypt';

export class UserService {
    private userRepo: Repository<User>;

    constructor(userRepo: Repository<User>) {
        this.userRepo = userRepo;
    }

    /**
     * Fetch all users.
     * Tests:
     * - Successful fetch.
     * - Mock repo error (expect 500).
     */
    async getAllUsers(): Promise<User[]> {
        try {
            return await this.userRepo.find();
        } catch (error) {
            logger.error('Failed to get all users', { error });
            throw new ServiceError('Unable to fetch users at this time.', 500);
        }
    }

    /**
     * Fetch a user by ID.
     * @param id - The user ID.
     * Tests:
     * - Invalid ID (expect 400).
     * - Non-existent user (expect 404).
     * - Mock repo error (expect 500).
     */
    async getUserById(id: string): Promise<User> {
        if (!id || isNaN(Number(id))) {
            throw new ServiceError('Invalid user ID provided', 400);
        }

        try {
            const user = await this.userRepo.findOneBy({ id: Number(id) });

            if (!user) {
                throw new ServiceError('User not found', 404);
            }

            return user;
        } catch (error) {
            logger.error(`Failed to get user with ID: ${id}`, { error });
            if (error instanceof ServiceError) throw error;
            throw new ServiceError('Unable to fetch user at this time. Please try again later.', 500);
        }
    }

    /**
     * Create a new user.
     * @param dto - The user data.
     * Tests:
     * - Missing username/password (expect 400).
     * - Duplicate username (expect 400).
     * - Mock repo error (expect 500).
     */
    async createUser(dto: CreateUserDTO): Promise<User> {
        const { username, password, role } = dto;

        if (!username || !password) {
            throw new ServiceError('Username and password are required', 400);
        }

        try {
            const existingUser = await this.userRepo.findOneBy({ username });
            if (existingUser) {
                throw new ServiceError('Username already exists', 400);
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = this.userRepo.create({
                username,
                password: hashedPassword,
                userRoles: role ? [role] : ['user'],
            });

            const savedUser = await this.userRepo.save(user);
            logger.info(`Created new user with ID: ${savedUser.id}`);
            return savedUser;
        } catch (error) {
            logger.error('Failed to create a new user', { error });
            if (error instanceof ServiceError) throw error;
            throw new ServiceError('Unable to create user at this time. Please try again later.', 500);
        }
    }

    /**
     * Update a user by ID.
     * @param id - The user ID.
     * @param updateData - The update fields.
     * Tests:
     * - Invalid ID (expect 400).
     * - Non-existent user (expect 404).
     * - Duplicate username (expect 400).
     * - Mock repo error (expect 500).
     */
    async updateUserById(id: string, updateData: Partial<User>): Promise<User> {
        if (!id || isNaN(Number(id))) {
            throw new ServiceError('Invalid user ID provided', 400);
        }

        try {
            const user = await this.getUserById(id);

            if (updateData.username) {
                const existingUser = await this.userRepo.findOneBy({ username: updateData.username });
                if (existingUser && existingUser.id !== user.id) {
                    throw new ServiceError('Username already exists', 400);
                }
                user.username = updateData.username;
            }

            if (updateData.password) {
                user.password = await bcrypt.hash(updateData.password, 10);
            }

            if (updateData.userRoles) {
                user.userRoles = updateData.userRoles;
            }

            const updatedUser = await this.userRepo.save(user);
            logger.info(`Updated user with ID: ${updatedUser.id}`);
            return updatedUser;
        } catch (error) {
            logger.error(`Failed to update user with ID: ${id}`, { error });
            if (error instanceof ServiceError) throw error;
            throw new ServiceError('Unable to update user at this time. Please try again later.', 500);
        }
    }

    /**
     * Delete a user by ID.
     * @param id - The user ID.
     * Tests:
     * - Invalid ID (expect 400).
     * - Non-existent user (expect 404).
     * - Mock repo error (expect 500).
     */
    async deleteUserById(id: string): Promise<{ message: string }> {
        if (!id || isNaN(Number(id))) {
            throw new ServiceError('Invalid user ID provided', 400);
        }

        try {
            const user = await this.getUserById(id);
            await this.userRepo.remove(user);
            logger.info(`Deleted user with ID: ${id}`);
            return { message: 'User deleted successfully' };
        } catch (error) {
            logger.error(`Failed to delete user with ID: ${id}`, { error });
            if (error instanceof ServiceError) throw error;
            throw new ServiceError('Unable to delete user at this time. Please try again later.', 500);
        }
    }
}
