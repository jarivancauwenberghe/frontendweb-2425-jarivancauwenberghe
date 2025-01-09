import request from 'supertest';
import { app } from '../core/index';
import { AppDataSource } from '../data/data-source';
import { Movie } from '../entity/movie';
import { User } from '../entity/user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from 'config';

describe('MovieController Integration Tests with Authorization Checks', () => {
    let adminToken: string;
    let userToken: string;
    let createdMovie: Movie;

    beforeAll(async () => {
        await AppDataSource.initialize();
        await AppDataSource.getRepository(Movie).delete({});
        await AppDataSource.getRepository(User).delete({});

        // Create a regular user
        const regularUser = await AppDataSource.getRepository(User).save({
            username: 'regularuser',
            password: await bcrypt.hash('UserPass123!', 10),
            userRoles: ['user']
        });

        // Create an admin user
        const adminUser = await AppDataSource.getRepository(User).save({
            username: 'adminuser',
            password: await bcrypt.hash('AdminPass123!', 10),
            userRoles: ['admin']
        });

        // Log in regular user
        const userLoginResponse = await request(app)
            .post('/api/users/login')
            .send({ username: 'regularuser', password: 'UserPass123!' });
        userToken = userLoginResponse.body.token;

        // Log in admin user
        const adminLoginResponse = await request(app)
            .post('/api/users/login')
            .send({ username: 'adminuser', password: 'AdminPass123!' });
        adminToken = adminLoginResponse.body.token;
    });

    afterAll(async () => {
        await AppDataSource.destroy();
    });

    describe('GET /api/movies (Requires user role)', () => {
        it('should return 401 if no token is provided', async () => {
            const response = await request(app)
                .get('/api/movies')
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Authorization token missing');
        });

        it('should return 401 if token is invalid', async () => {
            // Create a fake token
            const fakeToken = jwt.sign({ id: 1, role: 'user' }, 'fake-secret');

            const response = await request(app)
                .get('/api/movies')
                .set('Authorization', `Bearer ${fakeToken}`)
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Invalid token');
        });

        it('should allow access with a valid user token', async () => {
            const response = await request(app)
                .get('/api/movies')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });

    describe('POST /api/movies (Requires admin role)', () => {
        it('should return 403 if the user does not have admin role', async () => {
            const movieData = {
                title: 'User Movie',
                description: 'Created by a non-admin user',
                director: 'User Director'
            };

            const response = await request(app)
                .post('/api/movies')
                .set('Authorization', `Bearer ${userToken}`)
                .send(movieData)
                .expect(403);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Forbidden');
        });

        it('should create a new movie if the user has admin role', async () => {
            const movieData = {
                title: 'Inception',
                description: 'A mind-bending thriller',
                director: 'Christopher Nolan'
            };

            const response = await request(app)
                .post('/api/movies')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(movieData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.title).toBe(movieData.title);
            createdMovie = response.body.data;
        });

        it('should not create a movie with missing fields', async () => {
            const movieData = {
                description: 'Missing title and director'
            };
            const response = await request(app)
                .post('/api/movies')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(movieData)
                .expect(400);

            expect(response.body.message).toBe('Validation failed');
        });
    });

    describe('GET /api/movies/:id (Requires user role)', () => {
        it('should return a movie by ID for a user token', async () => {
            const response = await request(app)
                .get(`/api/movies/${createdMovie.id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id', createdMovie.id);
            expect(response.body.data.title).toBe(createdMovie.title);
        });

        it('should return 400 for invalid ID', async () => {
            const response = await request(app)
                .get('/api/movies/abc')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Validation failed');
        });
    });

    describe('PUT /api/movies/:id (Requires admin role)', () => {
        it('should not allow a user without admin role to update a movie', async () => {
            const updatedData = {
                title: 'Inception - Updated',
                description: 'An updated description'
            };
            const response = await request(app)
                .put(`/api/movies/${createdMovie.id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(updatedData)
                .expect(403);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Forbidden');
        });

        it('should update a movie by ID for admin', async () => {
            const updatedData = {
                title: 'Inception - Updated by Admin',
                description: 'An updated description for admin testing'
            };

            const response = await request(app)
                .put(`/api/movies/${createdMovie.id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updatedData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.title).toBe(updatedData.title);
            expect(response.body.data.description).toBe(updatedData.description);
        });

        it('should not update a movie with invalid data', async () => {
            const invalidData = {
                title: '' // Invalid title
            };
            const response = await request(app)
                .put(`/api/movies/${createdMovie.id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(invalidData)
                .expect(400);

            expect(response.body.message).toBe('Validation failed');
        });
    });

    describe('DELETE /api/movies/:id (Requires admin role)', () => {
        it('should not allow a user without admin role to delete a movie', async () => {
            await request(app)
                .delete(`/api/movies/${createdMovie.id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .expect(403);
        });

        it('should delete a movie by ID for admin', async () => {
            await request(app)
                .delete(`/api/movies/${createdMovie.id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            await request(app)
                .get(`/api/movies/${createdMovie.id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .expect(404);
        });
    });
});
