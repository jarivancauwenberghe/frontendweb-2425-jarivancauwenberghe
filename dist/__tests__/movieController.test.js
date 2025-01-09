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
const movie_1 = require("../entity/movie");
const review_1 = require("../entity/review");
const user_1 = require("../entity/user");
describe('Movie Controller Tests', () => {
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
    it('should get all movies', async () => {
        const response = await (0, supertest_1.default)(server).get('/api/movies').set('Authorization', `Bearer ${authToken}`);
        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });
    it('should get a movie by id', async () => {
        const firstMovieID = generatedIDs.movieIds[0];
        const getMovieResponse = await (0, supertest_1.default)(server).get(`/api/movies/${firstMovieID}`).set('Authorization', `Bearer ${authToken}`);
        expect(getMovieResponse.status).toBe(200);
        expect(getMovieResponse.body).toBeDefined();
        expect(getMovieResponse.body.title).toBeDefined();
    });
    it('should create a new movie', async () => {
        const newMovieData = {
            title: `New Movie - ${Date.now()}`,
            director: 'Director',
            description: 'Description'
        };
        const createMovieResponse = await (0, supertest_1.default)(server)
            .post('/api/movies')
            .send(newMovieData)
            .set('Authorization', `Bearer ${authToken}`);
        expect(createMovieResponse.status).toBe(201);
        expect(createMovieResponse.body).toBeDefined();
        expect(createMovieResponse.body.title).toBe(newMovieData.title);
    });
    it('should update a movie by id', async () => {
        const firstMovieID = generatedIDs.movieIds[0];
        const updatedTitle = `Updated Movie - ${Date.now()}`;
        const updateMovieData = {
            title: updatedTitle,
            director: 'Updated Director',
            description: 'Updated Description'
        };
        const updateMovieResponse = await (0, supertest_1.default)(server)
            .put(`/api/movies/${firstMovieID}`)
            .send(updateMovieData)
            .set('Authorization', `Bearer ${authToken}`);
        expect(updateMovieResponse.status).toBe(200);
        expect(updateMovieResponse.body).toBeDefined();
        expect(updateMovieResponse.body.title).toBe(updatedTitle);
    });
    /*  it('should delete a movie by id', async () => {
         const movieIdToDelete = generatedIDs!.movieIds[0];
         const deleteMovieResponse = await request(server)
             .delete(`/api/movies/${movieIdToDelete}`)
             .set('Authorization', `Bearer ${authToken}`);
         expect(deleteMovieResponse.status).toBe(204);
         const getDeletedMovieResponse = await request(server)
             .get(`/api/movies/${movieIdToDelete}`)
             .set('Authorization', `Bearer ${authToken}`);
         expect(getDeletedMovieResponse.status).toBe(404);
     }); */
    it('should return an error for invalid movie update data', async () => {
        const movieId = generatedIDs.movieIds[0];
        const invalidUpdateData = { title: '' };
        const response = await (0, supertest_1.default)(server)
            .put(`/api/movies/${movieId}`)
            .send(invalidUpdateData)
            .set('Authorization', `Bearer ${authToken}`);
        expect(response.status).toBe(400);
        /* expect(response.body.error).toBeDefined();
        expect(response.body.error).toBe('Validation failed'); */
    });
    /*  it('should not allow unauthorized access to movie data', async () => {
         const response = await request(server).get('/api/movies');
         expect(response.status).toBe(403);
     }); */
});
