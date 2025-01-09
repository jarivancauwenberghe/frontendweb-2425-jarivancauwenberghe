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
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_1 = require("../entity/user");
const movie_1 = require("../entity/movie");
const review_1 = require("../entity/review");
describe('User Controller Tests', () => {
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
    it('should get all users', async () => {
        const response = await (0, supertest_1.default)(server).get('/api/users').set('Authorization', `Bearer ${authToken}`);
        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });
    it('should get a user by id', async () => {
        const firstUserID = generatedIDs.userIds[0];
        const getUserResponse = await (0, supertest_1.default)(server).get(`/api/users/${firstUserID}`).set('Authorization', `Bearer ${authToken}`);
        expect(getUserResponse.status).toBe(200);
        expect(getUserResponse.body).toBeDefined();
        expect(getUserResponse.body.username).toBeDefined();
    });
    it('should create a new user', async () => {
        const newUser = {
            username: `newUser-${Date.now()}`,
            password: await bcrypt_1.default.hash('password123', 10),
            userRoles: ['user']
        };
        const registerResponse = await (0, supertest_1.default)(server)
            .post('/api/users')
            .send(newUser)
            .set('Authorization', `Bearer ${authToken}`);
        expect(registerResponse.status).toBe(201);
        expect(registerResponse.body).toBeDefined();
        expect(registerResponse.body.username).toBe(newUser.username);
    });
    it('should update a user by id', async () => {
        const userIdToUpdate = generatedIDs.userIds[0];
        const updatedUsername = `UpdatedUser-${Date.now()}`;
        const updatedUserData = { username: updatedUsername };
        const updateUserResponse = await (0, supertest_1.default)(server)
            .put(`/api/users/${userIdToUpdate}`)
            .send(updatedUserData)
            .set('Authorization', `Bearer ${authToken}`);
        expect(updateUserResponse.status).toBe(200);
        expect(updateUserResponse.body).toBeDefined();
        expect(updateUserResponse.body.username).toBe(updatedUsername);
    });
    it('should delete a user by id', async () => {
        const uniqueTitle = `UserToDelete-${Date.now()}`;
        const newUserData = {
            username: uniqueTitle,
            password: await bcrypt_1.default.hash('password123', 10),
            userRoles: ['user']
        };
        const userExistsResponse = await (0, supertest_1.default)(server)
            .post('/api/users')
            .send(newUserData)
            .set('Authorization', `Bearer ${authToken}`);
        expect(userExistsResponse.status).toBe(201);
        logger_1.default.info(userExistsResponse.body);
        const deleteUserResponse = await (0, supertest_1.default)(server)
            .delete(`/api/users/${userExistsResponse.body.id}`)
            .set('Authorization', `Bearer ${authToken}`);
        expect(deleteUserResponse.status).toBe(204);
        const getDeletedUserResponse = await (0, supertest_1.default)(server)
            .get(`/api/users/${userExistsResponse.body.id}`)
            .set('Authorization', `Bearer ${authToken}`);
        expect(getDeletedUserResponse.status).toBe(404);
    });
    it('should return an error for invalid user update data', async () => {
        const userId = generatedIDs.userIds[0];
        const invalidUpdateData = { username: '' };
        const response = await (0, supertest_1.default)(server)
            .put(`/api/users/${userId}`)
            .send(invalidUpdateData)
            .set('Authorization', `Bearer ${authToken}`);
        expect(response.status).toBe(400);
        /*  expect(response.body.error).toBeDefined();
         expect(response.body.error).toBe('Validation failed'); */
    });
    /* it('should not allow unauthorized access to user data', async () => {
        const response = await request(server).get('/api/users');
        expect(response.status).toBe(403);
    }); */
});
