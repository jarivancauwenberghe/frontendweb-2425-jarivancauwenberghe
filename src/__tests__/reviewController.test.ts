import request from 'supertest';
import { app } from '../core/index';
import { AppDataSource } from '../data/data-source';
import { Movie } from '../entity/movie';
import { Review } from '../entity/review';
import { User } from '../entity/user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from 'config';

describe('ReviewController Integration Tests with Authorization Checks', () => {
    let createdReview: Review;
    let createdMovie: Movie;
    let userToken: string;
    let adminToken: string;

    beforeAll(async () => {
        // Initialize and clean the database
        await AppDataSource.initialize();
        await AppDataSource.getRepository(Review).delete({});
        await AppDataSource.getRepository(Movie).delete({});
        await AppDataSource.getRepository(User).delete({});

        // Create a user with 'user' role
        const regularUser = await AppDataSource.getRepository(User).save({
            username: 'regularuser',
            password: await bcrypt.hash('UserPass123!', 10),
            userRoles: ['user']
        });

        // Create an admin-only user (no 'user' role)
        const adminOnlyUser = await AppDataSource.getRepository(User).save({
            username: 'adminonly',
            password: await bcrypt.hash('AdminPass123!', 10),
            userRoles: ['admin']
        });

        // Log in the regular user
        const userLoginResponse = await request(app)
            .post('/api/users/login')
            .send({ username: 'regularuser', password: 'UserPass123!' });
        userToken = userLoginResponse.body.token;

        // Log in the admin-only user
        const adminLoginResponse = await request(app)
            .post('/api/users/login')
            .send({ username: 'adminonly', password: 'AdminPass123!' });
        adminToken = adminLoginResponse.body.token;

        // Create a new movie
        createdMovie = await AppDataSource.getRepository(Movie).save({
            title: 'Inception',
            description: 'A mind-bending thriller',
            director: 'Christopher Nolan'
        });
    });

    afterAll(async () => {
        await AppDataSource.destroy();
    });

    describe('Authorization checks', () => {
        it('should return 401 if no token is provided when getting reviews', async () => {
            const response = await request(app).get('/api/reviews');
            expect(response.status).toBe(401);
            expect(response.body.message).toContain('Authorization token missing');
        });

        it('should return 401 if token is invalid', async () => {
            const fakeToken = jwt.sign({ id: 1, role: 'user' }, 'fake-secret');
            const response = await request(app)
                .get('/api/reviews')
                .set('Authorization', `Bearer ${fakeToken}`);
            expect(response.status).toBe(401);
            expect(response.body.message).toContain('Invalid token');
        });

        it('should return 403 if user does not have the "user" role', async () => {
            // adminOnlyUser tries to get reviews (needs 'user')
            const response = await request(app)
                .get('/api/reviews')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(403);
            expect(response.body.message).toContain('Forbidden');
        });
    });

    describe('Valid user role tests', () => {
        it('should create a new review with a valid user token', async () => {
            const reviewData = {
                rating: 5,
                comment: 'Amazing movie!',
                movieId: createdMovie.id,
                userId: 1 // regularUser has id 1 presumably
            };
            const response = await request(app)
                .post('/api/reviews')
                .set('Authorization', `Bearer ${userToken}`)
                .send(reviewData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.rating).toBe(reviewData.rating);
            createdReview = response.body.data;
        });

        it('should not create a review with an invalid rating', async () => {
            const reviewData = {
                rating: 6,
                comment: 'Out of range',
                movieId: createdMovie.id,
                userId: 1
            };
            const response = await request(app)
                .post('/api/reviews')
                .set('Authorization', `Bearer ${userToken}`)
                .send(reviewData)
                .expect(400);

            expect(response.body.message).toBe('Validation failed');
        });

        it('should get all reviews', async () => {
            const response = await request(app)
                .get('/api/reviews')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
        });

        it('should get a review by ID', async () => {
            const response = await request(app)
                .get(`/api/reviews/${createdReview.id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id', createdReview.id);
        });

        it('should update a review by ID', async () => {
            const updatedData = {
                rating: 4,
                comment: 'Still great, but not perfect'
            };
            const response = await request(app)
                .put(`/api/reviews/${createdReview.id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(updatedData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.rating).toBe(updatedData.rating);
            expect(response.body.data.comment).toBe(updatedData.comment);
        });

        it('should delete a review by ID', async () => {
            await request(app)
                .delete(`/api/reviews/${createdReview.id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .expect(204);

            await request(app)
                .get(`/api/reviews/${createdReview.id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .expect(404);
        });
    });
});
