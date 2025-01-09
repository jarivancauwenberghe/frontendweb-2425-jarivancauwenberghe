import request from 'supertest';
import { app } from '../core/index';
import { AppDataSource } from '../data/data-source';
import { Movie } from '../entity/movie';
import { User } from '../entity/user';
import { Watchlist } from '../entity/watchlist';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('WatchlistController Integration Tests with Authorization Checks', () => {
    let createdMovie: Movie;
    let userToken: string;
    let adminToken: string;
    let createdWatchlist: Watchlist;

    beforeAll(async () => {
        await AppDataSource.initialize();
        await AppDataSource.getRepository(Watchlist).delete({});
        await AppDataSource.getRepository(Movie).delete({});
        await AppDataSource.getRepository(User).delete({});

        // Create a user with 'user' role
        const regularUser = await AppDataSource.getRepository(User).save({
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

        // Log in regular user
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
            title: 'Inception',
            description: 'A mind-bending thriller',
            director: 'Christopher Nolan'
        });
    });

    afterAll(async () => {
        await AppDataSource.destroy();
    });

    describe('Authorization checks', () => {
        it('should return 401 if no token is provided', async () => {
            const response = await request(app).get('/api/watchlists');
            expect(response.status).toBe(401);
            expect(response.body.message).toContain('Authorization token missing');
        });

        it('should return 401 if token is invalid', async () => {
            const fakeToken = jwt.sign({ id: 1, role: 'user' }, 'fake-secret');
            const response = await request(app)
                .get('/api/watchlists')
                .set('Authorization', `Bearer ${fakeToken}`);
            expect(response.status).toBe(401);
            expect(response.body.message).toContain('Invalid token');
        });

        it('should return 403 if user does not have "user" role', async () => {
            const response = await request(app)
                .get('/api/watchlists')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(403);
            expect(response.body.message).toContain('Forbidden');
        });
    });

    describe('Valid user role tests', () => {
        it('should create a new watchlist item', async () => {
            const watchlistData = {
                userId: 1, // The regularUser presumably has id 1
                name: 'My Favorite Movies',
                movieIds: [createdMovie.id]
            };
            const response = await request(app)
                .post('/api/watchlists')
                .set('Authorization', `Bearer ${userToken}`)
                .send(watchlistData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            createdWatchlist = response.body.data;
        });

        it('should get all watchlists', async () => {
            const response = await request(app)
                .get('/api/watchlists')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
        });

        it('should get a watchlist by ID', async () => {
            const response = await request(app)
                .get(`/api/watchlists/${createdWatchlist.id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe(createdWatchlist.id);
        });

        it('should update a watchlist by ID', async () => {
            const updateData = {
                name: 'Updated Watchlist Name'
            };
            const response = await request(app)
                .put(`/api/watchlists/${createdWatchlist.id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe(updateData.name);
        });

        it('should delete a watchlist by ID', async () => {
            await request(app)
                .delete(`/api/watchlists/${createdWatchlist.id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .expect(204);

            await request(app)
                .get(`/api/watchlists/${createdWatchlist.id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .expect(404);
        });
    });
});
