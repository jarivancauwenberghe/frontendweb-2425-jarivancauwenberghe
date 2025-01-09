import request from 'supertest';
import express from 'express';
import userRouter from '../rest/userRouter';
import { AppDataSource } from '../data/data-source';
import { User } from '../entity/user';
import { errorMiddleware } from '../core/errorMiddleware';

// Currently mocking authorize middleware to bypass authentication
// For full coverage, consider removing this mock and testing real tokens and roles.
jest.mock('../core/authorization', () => ({
    authorize: () => (req: any, res: any, next: any) => next(),
}));

const app = express();
app.use(express.json());
app.use('/users', userRouter);
app.use(errorMiddleware);

describe('UserController Integration Tests', () => {
    beforeAll(async () => {
        await AppDataSource.initialize();
        const userRepo = AppDataSource.getRepository(User);

        // Seed a user to test duplicate username scenario
        await userRepo.save({
            id: 1,
            username: 'testuser',
            password: 'hashedpassword',
            userRoles: ['user'],
            reviews: [],
            watchlists: [],
            recommendations: [],
        } as User);
    });

    afterAll(async () => {
        await AppDataSource.destroy();
    });

    describe('POST /users', () => {
        /**
         * Tests:
         * - Successful creation (201)
         * - Validation failure (400)
         * - Duplicate username (400)
         * - With real authorization in place, test that only admin can create new users (403 if not admin)
         */
        it('should create a new user', async () => {
            const newUser = {
                username: 'newuser',
                password: 'password123',
                role: 'user',
            };

            const response = await request(app)
                .post('/users')
                .send(newUser);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data).toMatchObject({
                username: newUser.username,
                userRoles: [newUser.role],
            });
        });

        it('should return 400 for invalid input', async () => {
            const invalidUser = {
                username: '',
                password: 'short',
            };

            const response = await request(app)
                .post('/users')
                .send(invalidUser);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Validation failed');
            expect(response.body.errors).toBeDefined();
        });

        it('should return 400 if username already exists', async () => {
            const existingUser = {
                username: 'testuser', // already in DB
                password: 'password123',
                role: 'user',
            };

            const response = await request(app)
                .post('/users')
                .send(existingUser);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Username already exists');
        });
    });

    // Additional tests for GET, PUT, DELETE:
    // - GET /users (should require admin)
    // - GET /users/:id (valid/invalid, 404 if not found)
    // - PUT /users/:id (test updating username to an existing one, changing roles)
    // - DELETE /users/:id (test deleting existing and non-existing user)
    // Remember to adjust tests once authorization is fully integrated.
});
