"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMockData = void 0;
const data_source_1 = require("./data-source");
const movie_1 = require("../entity/movie");
const review_1 = require("../entity/review");
const user_1 = require("../entity/user");
const bcrypt_1 = __importDefault(require("bcrypt"));
const generateMockData = async () => {
    const userRepository = data_source_1.dataSource.getRepository(user_1.User);
    const movieRepository = data_source_1.dataSource.getRepository(movie_1.Movie);
    const reviewRepository = data_source_1.dataSource.getRepository(review_1.Review);
    let savedUsers = await userRepository.find();
    if (savedUsers.length === 0) {
        const users = [
            { username: 'user1', password: await bcrypt_1.default.hash('password1', 10), userRoles: ['user'] },
            { username: 'user2', password: await bcrypt_1.default.hash('password2', 10), userRoles: ['user'] },
            { username: 'user3', password: await bcrypt_1.default.hash('password3', 10), userRoles: ['user'] },
        ];
        savedUsers = await userRepository.save(users);
    }
    let savedMovies = await movieRepository.find();
    if (savedMovies.length === 0) {
        const movies = [
            { title: 'Inception', director: 'Christopher Nolan', description: 'A mind-bending thriller' },
            { title: 'The Matrix', director: 'The Wachowskis', description: 'A hacker discovers reality' },
            { title: 'Interstellar', director: 'Christopher Nolan', description: 'Space exploration' },
        ];
        savedMovies = await movieRepository.save(movies);
    }
    let savedReviews = await reviewRepository.find();
    if (savedReviews.length === 0) {
        const reviews = [
            { rating: 5, comment: 'Amazing movie!', movie: savedMovies[0], user: savedUsers[0] },
            { rating: 4, comment: 'Great movie!', movie: savedMovies[1], user: savedUsers[1] },
            { rating: 5, comment: 'Mind-blowing!', movie: savedMovies[2], user: savedUsers[2] },
        ];
        savedReviews = await reviewRepository.save(reviews);
    }
    return {
        userIds: savedUsers.map(user => user.id),
        movieIds: savedMovies.map(movie => movie.id),
        reviewIds: savedReviews.map(review => review.id)
    };
};
exports.generateMockData = generateMockData;
