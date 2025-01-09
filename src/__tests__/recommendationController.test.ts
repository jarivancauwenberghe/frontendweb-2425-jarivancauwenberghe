import request from 'supertest';
import { app } from '../core/index';
import { AppDataSource } from '../data/data-source';
import { Recommendation } from '../entity/recommendation';
import { User } from '../entity/user';
import { Movie } from '../entity/movie';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('RecommendationController Integration Tests with Authorization Checks', () => {
    let userToken: string;
    let adminToken: string;
    let createdMovie: Movie;
    let createdUser: User;
    let createdRecommendation: Recommendation;

    beforeAll(async () => {
        await AppDataSource.initialize();
        await AppDataSource.getRepository(Recommendation).delete({});
        await AppDataSource.getRepository(Movie).delete({});
        await AppDataSource.getRepository(User).delete({});

        // Create a user with 'user' role
        createdUser = await AppDataSource.getRepository(User).save({
            username: 'regularuser',
            password: await bcrypt.hash('UserPass123!', 10),
            userRoles: ['user']
        });

        // Create an admin-only user
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

        // Log in admin-only user
        const adminLoginResponse = await request(app)
            .post('/api/users/login')
            .send({ username: 'adminonly', password: 'AdminPass123!' });
        adminToken = adminLoginResponse.body.token;

        createdMovie = await AppDataSource.getRepository(Movie).save({
            title: 'Test Movie',
            description: 'A test movie',
            director: 'Director'
        });

        // Create an initial recommendation
        createdRecommendation = await AppDataSource.getRepository(Recommendation).save({
            user: createdUser,
            movie: createdMovie,
            reason: 'Great movie!',
            createdAt: new Date()
        });
    });

    afterAll(async () => {
        await AppDataSource.destroy();
    });

    describe('Authorization checks', () => {
        it('should return 401 if no token is provided', async () => {
            const response = await request(app).get('/api/recommendations');
            expect(response.status).toBe(401);
            expect(response.body.message).toContain('Authorization token missing');
        });

        it('should return 401 if token is invalid', async () => {
            const fakeToken = jwt.sign({ id: 1, role: 'user' }, 'fake-secret');
            const response = await request(app)
                .get('/api/recommendations')
                .set('Authorization', `Bearer ${fakeToken}`);
            expect(response.status).toBe(401);
            expect(response.body.message).toContain('Invalid token');
        });

        it('should return 403 if user does not have "user" role', async () => {
            const response = await request(app)
                .get('/api/recommendations')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(403);
            expect(response.body.message).toContain('Forbidden');
        });
    });

    describe('Valid user role tests', () => {
        it('should return all recommendations', async () => {
            const response = await request(app)
                .get('/api/recommendations')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
        });

        it('should get a recommendation by ID', async () => {
            const response = await request(app)
                .get(`/api/recommendations/${createdRecommendation.id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe(createdRecommendation.id);
        });

        it('should create a new recommendation', async () => {
            const newRecommendation = {
                movieId: createdMovie.id,
                userId: createdUser.id,
                reason: 'Excellent storyline!'
            };

            const response = await request(app)
                .post('/api/recommendations')
                .set('Authorization', `Bearer ${userToken}`)
                .send(newRecommendation)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
        });

        it('should update a recommendation by ID', async () => {
            const updatedReason = 'Updated reason';
            const response = await request(app)
                .put(`/api/recommendations/${createdRecommendation.id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ reason: updatedReason })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.reason).toBe(updatedReason);
        });

        it('should delete a recommendation by ID', async () => {
            await request(app)
                .delete(`/api/recommendations/${createdRecommendation.id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .expect(204);

            await request(app)
                .get(`/api/recommendations/${createdRecommendation.id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .expect(404);
        });
    });
});
