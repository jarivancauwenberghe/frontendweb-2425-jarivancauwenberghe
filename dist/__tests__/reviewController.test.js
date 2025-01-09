"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("jest");
const supertest_1 = __importDefault(require("supertest"));
const index_1 = require("../core/index");
const data_source_1 = require("../data/data-source");
const mock_data_1 = require("../data/mock_data");
const logger_1 = __importDefault(require("../core/logger"));
const review_1 = require("../entity/review");
const user_1 = require("../entity/user");
const movie_1 = require("../entity/movie");
describe('Review Controller Tests', () => {
    let server;
    let generatedIDs;
    let authToken;
    beforeAll(async () => {
        server = await (0, index_1.startServer)();
        generatedIDs = await (0, mock_data_1.generateMockData)();
        if (!generatedIDs)
            throw new Error("Failed to generate mock data");
        const loginResponse = await (0, supertest_1.default)(server)
            .post('/api/users/login')
            .send({ username: 'user1', password: 'password1' });
        authToken = loginResponse.body.token;
    });
    afterAll(async () => {
        await data_source_1.dataSource.getRepository(review_1.Review).delete({});
        await data_source_1.dataSource.getRepository(movie_1.Movie).delete({});
        await data_source_1.dataSource.getRepository(user_1.User).delete({});
        await data_source_1.dataSource.destroy();
        await server.close();
        logger_1.default.info('Data Source connection has been closed!');
    });
    it('should get all reviews', async () => {
        const response = await (0, supertest_1.default)(server).get('/api/reviews').set('Authorization', `Bearer ${authToken}`);
        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });
    it('should get a review by id', async () => {
        const firstReviewID = generatedIDs.reviewIds[0];
        const getReviewResponse = await (0, supertest_1.default)(server).get(`/api/reviews/${firstReviewID}`).set('Authorization', `Bearer ${authToken}`);
        expect(getReviewResponse.status).toBe(200);
        expect(getReviewResponse.body).toBeDefined();
        expect(getReviewResponse.body.rating).toBeDefined();
    });
    it('should create a new review', async () => {
        const newReviewData = {
            rating: 5,
            movie: generatedIDs.movieIds[0],
            user: generatedIDs.userIds[0],
            comment: 'Fantastic!'
        };
        const createReviewResponse = await (0, supertest_1.default)(server)
            .post('/api/reviews')
            .send(newReviewData)
            .set('Authorization', `Bearer ${authToken}`);
        expect(createReviewResponse.status).toBe(201);
        expect(createReviewResponse.body).toBeDefined();
        expect(createReviewResponse.body.rating).toBe(5);
    });
    it('should update a review by id', async () => {
        const firstReviewID = generatedIDs.reviewIds[0];
        const updatedRating = 4;
        const updateReviewResponse = await (0, supertest_1.default)(server)
            .put(`/api/reviews/${firstReviewID}`)
            .send({ rating: updatedRating })
            .set('Authorization', `Bearer ${authToken}`);
        expect(updateReviewResponse.status).toBe(200);
        expect(updateReviewResponse.body).toBeDefined();
        expect(updateReviewResponse.body.rating).toBe(updatedRating);
    });
    it('should delete a review by id', async () => {
        const reviewIdToDelete = generatedIDs.reviewIds[1];
        const deleteReviewResponse = await (0, supertest_1.default)(server)
            .delete(`/api/reviews/${reviewIdToDelete}`)
            .set('Authorization', `Bearer ${authToken}`);
        expect(deleteReviewResponse.status).toBe(204);
        const getDeletedReviewResponse = await (0, supertest_1.default)(server)
            .get(`/api/reviews/${reviewIdToDelete}`)
            .set('Authorization', `Bearer ${authToken}`);
        expect(getDeletedReviewResponse.status).toBe(404);
    });
    it('should return an error for invalid review update data', async () => {
        const reviewId = generatedIDs.reviewIds[0];
        const invalidUpdateData = { rating: null };
        const response = await (0, supertest_1.default)(server)
            .put(`/api/reviews/${reviewId}`)
            .send(invalidUpdateData)
            .set('Authorization', `Bearer ${authToken}`);
        expect(response.status).toBe(400);
        /*     expect(response.body.error).toBeDefined();
            expect(response.body.error).toBe('Validation failed'); */
    });
    /*  it('should not allow unauthorized access to create a review', async () => {
         const newReviewData = {
             rating: 3,
             movieId: generatedIDs!.movieIds[0],
             userId: generatedIDs!.userIds[0],
             comment: 'Good!'
         };
         const response = await request(server).post('/api/reviews').send(newReviewData);
         expect(response.status).toBe(403);
     }); */
});
