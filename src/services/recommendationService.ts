import { Repository } from 'typeorm';
import { Recommendation } from '../entity/recommendation';
import { User } from '../entity/user';
import { Movie } from '../entity/movie';
import { ServiceError } from '../core/serviceError';
import logger from '../core/logger';
import { CreateRecommendationDTO } from '../dto/createRecommendationDTO';
import { UpdateRecommendationDTO } from '../dto/updateRecommendationDTO';

export class RecommendationService {
    private recommendationRepo: Repository<Recommendation>;
    private userRepo: Repository<User>;
    private movieRepo: Repository<Movie>;

    constructor(
        recommendationRepo: Repository<Recommendation>,
        userRepo: Repository<User>,
        movieRepo: Repository<Movie>
    ) {
        this.recommendationRepo = recommendationRepo;
        this.userRepo = userRepo;
        this.movieRepo = movieRepo;
    }

    /**
     * Fetch all recommendations.
     * Tests:
     * - Successful fetch (expect 200).
     * - Mock repo error (expect 500).
     */
    async getAllRecommendations(): Promise<Recommendation[]> {
        try {
            return await this.recommendationRepo.find({ relations: ['user', 'movie'] });
        } catch (error) {
            logger.error('Failed to get all recommendations', { error });
            throw new ServiceError('Unable to fetch recommendations at this time.', 500);
        }
    }

    /**
     * Fetch a recommendation by ID.
     * @param id - The ID of the recommendation.
     * Tests:
     * - Invalid ID (expect 400).
     * - Non-existent recommendation (expect 404).
     * - Mock repo error (expect 500).
     */
    async getRecommendationById(id: string): Promise<Recommendation> {
        const recommendationId = Number(id);
        if (!id || isNaN(recommendationId)) {
            throw new ServiceError('Invalid recommendation ID provided', 400);
        }

        try {
            const recommendation = await this.recommendationRepo.findOne({
                where: { id: recommendationId },
                relations: ['user', 'movie'],
            });

            if (!recommendation) {
                throw new ServiceError('Recommendation not found', 404);
            }

            return recommendation;
        } catch (error) {
            logger.error(`Failed to get recommendation with ID: ${id}`, { error });
            if (error instanceof ServiceError) throw error;
            throw new ServiceError('Unable to fetch recommendation at this time. Please try again later.', 500);
        }
    }

    /**
     * Create a new recommendation.
     * @param dto - The DTO for the new recommendation.
     * Tests:
     * - Missing required fields (expect 400).
     * - Non-existent user or movie (expect 404).
     * - Duplicate recommendation (expect 400).
     * - Mock repo error (expect 500).
     */
    async createRecommendation(dto: CreateRecommendationDTO): Promise<Recommendation> {
        const { movieId, userId, reason } = dto;

        if (!movieId || !userId || !reason) {
            throw new ServiceError('User, Movie, and Reason are required', 400);
        }

        try {
            const user = await this.userRepo.findOneBy({ id: userId });
            const movie = await this.movieRepo.findOneBy({ id: movieId });

            if (!user) {
                throw new ServiceError('User not found', 404);
            }
            if (!movie) {
                throw new ServiceError('Movie not found', 404);
            }

            const existingRecommendation = await this.recommendationRepo.findOne({
                where: {
                    user: { id: user.id },
                    movie: { id: movie.id },
                },
            });
            if (existingRecommendation) {
                throw new ServiceError('Recommendation already exists for this user and movie', 400);
            }

            const recommendation = this.recommendationRepo.create({ user, movie, reason });
            const savedRecommendation = await this.recommendationRepo.save(recommendation);
            logger.info(`Created new recommendation with ID: ${savedRecommendation.id}`);
            return savedRecommendation;
        } catch (error) {
            logger.error('Failed to create a new recommendation', { error });
            if (error instanceof ServiceError) throw error;
            throw new ServiceError('Unable to create recommendation at this time. Please try again later.', 500);
        }
    }

    /**
     * Update a recommendation by ID.
     * @param id - The ID of the recommendation.
     * @param dto - The update data.
     * Tests:
     * - Invalid ID (expect 400).
     * - Non-existent recommendation (expect 404).
     * - Non-existent user/movie if IDs provided (expect 404).
     * - Empty reason (expect 400).
     * - Mock repo error (expect 500).
     */
    async updateRecommendationById(id: string, dto: UpdateRecommendationDTO): Promise<Recommendation> {
        const recommendationId = Number(id);
        if (!id || isNaN(recommendationId)) {
            throw new ServiceError('Invalid recommendation ID provided', 400);
        }

        if (dto.reason !== undefined && dto.reason.trim() === '') {
            throw new ServiceError('Reason cannot be empty', 400);
        }

        try {
            const recommendation = await this.getRecommendationById(id);

            if (dto.userId) {
                const user = await this.userRepo.findOneBy({ id: dto.userId });
                if (!user) {
                    throw new ServiceError('User not found', 404);
                }
                recommendation.user = user;
            }

            if (dto.movieId) {
                const movie = await this.movieRepo.findOneBy({ id: dto.movieId });
                if (!movie) {
                    throw new ServiceError('Movie not found', 404);
                }
                recommendation.movie = movie;
            }

            if (dto.reason !== undefined) {
                recommendation.reason = dto.reason;
            }

            const updatedRecommendation = await this.recommendationRepo.save(recommendation);
            logger.info(`Updated recommendation with ID: ${updatedRecommendation.id}`);
            return updatedRecommendation;
        } catch (error) {
            logger.error(`Failed to update recommendation with ID: ${id}`, { error });
            if (error instanceof ServiceError) throw error;
            throw new ServiceError('Unable to update recommendation at this time. Please try again later.', 500);
        }
    }

    /**
     * Delete a recommendation by ID.
     * @param id - The ID of the recommendation.
     * Tests:
     * - Invalid ID (expect 400).
     * - Non-existent recommendation (expect 404).
     * - Mock repo error (expect 500).
     */
    async deleteRecommendationById(id: string): Promise<{ message: string }> {
        const recommendationId = Number(id);
        if (!id || isNaN(recommendationId)) {
            throw new ServiceError('Invalid recommendation ID provided', 400);
        }

        try {
            const recommendation = await this.getRecommendationById(id);
            await this.recommendationRepo.remove(recommendation);
            logger.info(`Deleted recommendation with ID: ${id}`);
            return { message: 'Recommendation deleted successfully' };
        } catch (error) {
            logger.error(`Failed to delete recommendation with ID: ${id}`, { error });
            if (error instanceof ServiceError) throw error;
            throw new ServiceError('Unable to delete recommendation at this time. Please try again later.', 500);
        }
    }
}
