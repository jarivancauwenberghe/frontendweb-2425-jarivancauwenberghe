import { Repository } from 'typeorm';
import { Review } from '../entity/review';
import { User } from '../entity/user';
import { Movie } from '../entity/movie';
import { ServiceError } from '../core/serviceError';
import logger from '../core/logger';
import { CreateReviewDTO } from '../dto/createReviewDTO';
import { UpdateReviewDTO } from '../dto/updateReviewDTO';

export class ReviewService {
    private reviewRepo: Repository<Review>;
    private userRepo: Repository<User>;
    private movieRepo: Repository<Movie>;

    constructor(
        reviewRepo: Repository<Review>,
        userRepo: Repository<User>,
        movieRepo: Repository<Movie>
    ) {
        this.reviewRepo = reviewRepo;
        this.userRepo = userRepo;
        this.movieRepo = movieRepo;
    }

    /**
     * Fetch all reviews.
     * Tests:
     * - Successful fetch.
     * - Mock repo error (expect 500).
     */
    async getAllReviews(): Promise<Review[]> {
        try {
            return await this.reviewRepo.find({ relations: ['user', 'movie'] });
        } catch (error) {
            logger.error('Failed to get all reviews', { error });
            throw new ServiceError('Unable to fetch reviews at this time.', 500);
        }
    }

    /**
     * Fetch a review by ID.
     * @param id - The ID of the review.
     * Tests:
     * - Invalid ID (expect 400).
     * - Non-existent review (expect 404).
     * - Mock repo error (expect 500).
     */
    async getReviewById(id: string): Promise<Review> {
        const reviewId = Number(id);
        if (!id || isNaN(reviewId)) {
            throw new ServiceError('Invalid review ID provided', 400);
        }

        try {
            const review = await this.reviewRepo.findOne({
                where: { id: reviewId },
                relations: ['user', 'movie'],
            });

            if (!review) {
                throw new ServiceError('Review not found', 404);
            }

            return review;
        } catch (error) {
            logger.error(`Failed to get review with ID: ${id}`, { error });
            if (error instanceof ServiceError) throw error;
            throw new ServiceError('Unable to fetch review at this time. Please try again later.', 500);
        }
    }

    /**
     * Create a new review.
     * @param dto - The DTO for the new review.
     * Tests:
     * - Missing required fields (expect 400).
     * - Invalid rating range (expect 400).
     * - Non-existent user/movie (expect 404).
     * - Mock repo error (expect 500).
     */
    async createReview(dto: CreateReviewDTO): Promise<Review> {
        const { movieId, userId, rating, comment } = dto;

        if (!movieId || !userId || rating === undefined || comment === undefined) {
            throw new ServiceError('User, Movie, Rating, and Comment are required', 400);
        }

        if (rating < 1 || rating > 5) {
            throw new ServiceError('Rating must be between 1 and 5', 400);
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

            const review = this.reviewRepo.create({ user, movie, rating, comment });
            const savedReview = await this.reviewRepo.save(review);
            logger.info(`Created new review with ID: ${savedReview.id}`);
            return savedReview;
        } catch (error) {
            logger.error('Failed to create a new review', { error });
            if (error instanceof ServiceError) throw error;
            throw new ServiceError('Unable to create review at this time. Please try again later.', 500);
        }
    }

    /**
     * Update a review by ID.
     * @param id - The ID of the review.
     * @param dto - The update data.
     * Tests:
     * - Invalid ID (expect 400).
     * - Non-existent review (expect 404).
     * - Invalid rating (expect 400).
     * - Non-existent user/movie if provided (expect 404).
     * - Mock repo error (expect 500).
     */
    async updateReviewById(id: string, dto: UpdateReviewDTO): Promise<Review> {
        const reviewId = Number(id);
        if (!id || isNaN(reviewId)) {
            throw new ServiceError('Invalid review ID provided', 400);
        }

        if (dto.rating !== undefined && (dto.rating < 1 || dto.rating > 5)) {
            throw new ServiceError('Rating must be between 1 and 5', 400);
        }

        try {
            const review = await this.getReviewById(id);

            if (dto.userId) {
                const user = await this.userRepo.findOneBy({ id: dto.userId });
                if (!user) {
                    throw new ServiceError('User not found', 404);
                }
                review.user = user;
            }

            if (dto.movieId) {
                const movie = await this.movieRepo.findOneBy({ id: dto.movieId });
                if (!movie) {
                    throw new ServiceError('Movie not found', 404);
                }
                review.movie = movie;
            }

            if (dto.rating !== undefined) {
                review.rating = dto.rating;
            }

            if (dto.comment !== undefined) {
                review.comment = dto.comment;
            }

            const updatedReview = await this.reviewRepo.save(review);
            logger.info(`Updated review with ID: ${updatedReview.id}`);
            return updatedReview;
        } catch (error) {
            logger.error(`Failed to update review with ID: ${id}`, { error });
            if (error instanceof ServiceError) throw error;
            throw new ServiceError('Unable to update review at this time. Please try again later.', 500);
        }
    }

    /**
     * Delete a review by ID.
     * @param id - The ID of the review.
     * Tests:
     * - Invalid ID (expect 400).
     * - Non-existent review (expect 404).
     * - Mock repo error (expect 500).
     */
    async deleteReviewById(id: string): Promise<{ message: string }> {
        const reviewId = Number(id);
        if (!id || isNaN(reviewId)) {
            throw new ServiceError('Invalid review ID provided', 400);
        }

        try {
            const review = await this.getReviewById(id);
            await this.reviewRepo.remove(review);
            logger.info(`Deleted review with ID: ${id}`);
            return { message: 'Review deleted successfully' };
        } catch (error) {
            logger.error(`Failed to delete review with ID: ${id}`, { error });
            if (error instanceof ServiceError) throw error;
            throw new ServiceError('Unable to delete review at this time. Please try again later.', 500);
        }
    }
}
