import { AppDataSource } from '../data/data-source';
import { Movie } from '../entity/movie';
import { Review } from '../entity/review';
import { User } from '../entity/user';
import { Watchlist } from '../entity/watchlist';
import { Recommendation } from '../entity/recommendation';
import bcrypt from 'bcrypt';
import config from 'config';
import logger from '../core/logger';

export const generateMockData = async () => {
    try {
        const env = config.get('env');
        if (env !== 'development' && env !== 'test') {
            logger.warn('Mock data generation is not allowed in the production environment.');
            return;
        }

        const savedUsers = await createUsers();
        const savedMovies = await createMovies();
        const savedReviews = await createReviews(savedUsers, savedMovies);
        const savedWatchlists = await createWatchlists(savedUsers, savedMovies);
        const savedRecommendations = await createRecommendations(savedUsers, savedMovies);

        logger.info('Mock data generated successfully.');
        return {
            userIds: savedUsers.map(user => user.id),
            movieIds: savedMovies.map(movie => movie.id),
            reviewIds: savedReviews.map(review => review.id),
            watchlistIds: savedWatchlists.map(watchlist => watchlist.id),
            recommendationIds: savedRecommendations.map(recommendation => recommendation.id),
        };
    } catch (error) {
        logger.error('Failed to generate mock data', { error });
        throw new Error('Mock data generation failed.');
    }
};

// Helper function to create users
async function createUsers() {
    const userRepository = AppDataSource.getRepository(User);
    let savedUsers = await userRepository.find();

    if (savedUsers.length === 0) {
        logger.info('No users found, creating mock users.');
        const users = await Promise.all([
            { username: 'user1', password: await bcrypt.hash('password1', 10), userRoles: ['user'] },
            { username: 'user2', password: await bcrypt.hash('password2', 10), userRoles: ['user'] },
            { username: 'user3', password: await bcrypt.hash('password3', 10), userRoles: ['user'] },
            { username: 'admin1', password: await bcrypt.hash('adminpass1', 10), userRoles: ['admin'] },
            { username: 'admin2', password: await bcrypt.hash('adminpass2', 10), userRoles: ['user', 'admin'] },
        ]);

        savedUsers = await userRepository.save(users);
        logger.info('Mock users have been created.');
    } else {
        logger.info('Users already exist, skipping user creation.');
    }

    return savedUsers;
}

// Helper function to create movies
async function createMovies() {
    const movieRepository = AppDataSource.getRepository(Movie);
    let savedMovies = await movieRepository.find();

    if (savedMovies.length === 0) {
        logger.info('No movies found, creating mock movies.');
        const movies = [
            { title: 'Inception', director: 'Christopher Nolan', description: 'A mind-bending thriller' },
            { title: 'The Matrix', director: 'The Wachowskis', description: 'A hacker discovers reality' },
            { title: 'Interstellar', director: 'Christopher Nolan', description: 'Space exploration' },
        ];
        savedMovies = await movieRepository.save(movies);
        logger.info('Mock movies have been created.');
    } else {
        logger.info('Movies already exist, skipping movie creation.');
    }

    return savedMovies;
}

// Helper function to create reviews
async function createReviews(savedUsers: User[], savedMovies: Movie[]) {
    const reviewRepository = AppDataSource.getRepository(Review);
    let savedReviews = await reviewRepository.find();

    if (savedReviews.length === 0) {
        logger.info('No reviews found, creating mock reviews.');
        const reviews = [
            { rating: 5, comment: 'Amazing movie!', movie: savedMovies[0], user: savedUsers[0] },
            { rating: 4, comment: 'Great movie!', movie: savedMovies[1], user: savedUsers[1] },
            { rating: 5, comment: 'Mind-blowing!', movie: savedMovies[2], user: savedUsers[2] },
            { rating: 4, comment: 'Admin review - very insightful.', movie: savedMovies[0], user: savedUsers[3] },
        ];
        savedReviews = await reviewRepository.save(reviews);
        logger.info('Mock reviews have been created.');
    } else {
        logger.info('Reviews already exist, skipping review creation.');
    }

    return savedReviews;
}

// Helper function to create watchlists
async function createWatchlists(savedUsers: User[], savedMovies: Movie[]) {
    const watchlistRepository = AppDataSource.getRepository(Watchlist);
    let savedWatchlists = await watchlistRepository.find();

    if (savedWatchlists.length === 0) {
        logger.info('No watchlists found, creating mock watchlists.');
        const watchlists = [
            { user: savedUsers[0], movie: savedMovies[0] },
            { user: savedUsers[1], movie: savedMovies[1] },
            { user: savedUsers[2], movie: savedMovies[2] },
        ];
        savedWatchlists = await watchlistRepository.save(watchlists);
        logger.info('Mock watchlists have been created.');
    } else {
        logger.info('Watchlists already exist, skipping watchlist creation.');
    }

    return savedWatchlists;
}

// Helper function to create recommendations
async function createRecommendations(savedUsers: User[], savedMovies: Movie[]) {
    const recommendationRepository = AppDataSource.getRepository(Recommendation);
    let savedRecommendations = await recommendationRepository.find();

    if (savedRecommendations.length === 0) {
        logger.info('No recommendations found, creating mock recommendations.');
        const recommendations = [
            { user: savedUsers[0], movie: savedMovies[1], reason: 'Highly rated in your genre' },
            { user: savedUsers[1], movie: savedMovies[2], reason: 'Trending movie' },
            { user: savedUsers[2], movie: savedMovies[0], reason: 'Based on your recent activity' },
        ];
        savedRecommendations = await recommendationRepository.save(recommendations);
        logger.info('Mock recommendations have been created.');
    } else {
        logger.info('Recommendations already exist, skipping recommendation creation.');
    }

    return savedRecommendations;
}
