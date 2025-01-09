import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/reviewService';
import { AppDataSource } from '../data/data-source';
import { Review } from '../entity/review';
import { validationResult } from 'express-validator';
import { ServiceError } from '../core/serviceError';
import { CreateReviewDTO } from '../dto/createReviewDTO';
import { User } from '../entity/user';
import { Movie } from '../entity/movie';

export class ReviewController {
    private reviewService: ReviewService;

    constructor() {
        const reviewRepo = AppDataSource.getRepository(Review);
        const userRepo = AppDataSource.getRepository(User);
        const movieRepo = AppDataSource.getRepository(Movie);
        this.reviewService = new ReviewService(reviewRepo, userRepo, movieRepo);
    }

    /**
     * Get all reviews.
     * Tests:
     * - Return all reviews (200).
     * - Mock error for 500.
     */
    async getAllReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const reviews = await this.reviewService.getAllReviews();
            res.json({ success: true, data: reviews });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get a review by ID.
     * Tests:
     * - Invalid ID (400).
     * - Non-existent review (404).
     * - Success (200).
     */
    async getReviewById(req: Request, res: Response, next: NextFunction): Promise<void> {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ServiceError('Validation failed', 400, errors.array()));
        }

        try {
            const review = await this.reviewService.getReviewById(req.params.id);
            res.json({ success: true, data: review });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create a new review.
     * Tests:
     * - Missing fields (400).
     * - Invalid rating range (400).
     * - Non-existent user/movie (404).
     * - Success (201).
     */
    async createReview(req: Request, res: Response, next: NextFunction): Promise<void> {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ServiceError('Validation failed', 400, errors.array()));
        }

        try {
            const dto: CreateReviewDTO = {
                movieId: req.body.movieId,
                userId: req.body.userId,
                rating: req.body.rating,
                comment: req.body.comment,
            };
            const review = await this.reviewService.createReview(dto);
            res.status(201).json({ success: true, data: review });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update a review by ID.
     * Tests:
     * - Invalid ID (400).
     * - Non-existent review (404).
     * - Invalid rating (400).
     * - Non-existent user/movie if updating those fields (404).
     * - Success (200).
     */
    async updateReviewById(req: Request, res: Response, next: NextFunction): Promise<void> {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ServiceError('Validation failed', 400, errors.array()));
        }

        try {
            const { movieId, userId, rating, comment } = req.body;
            const updateData: Partial<Review> = {};
            if (movieId) updateData.movie = { id: movieId } as Movie;
            if (userId) updateData.user = { id: userId } as User;
            if (rating !== undefined) updateData.rating = rating;
            if (comment !== undefined) updateData.comment = comment;

            const review = await this.reviewService.updateReviewById(req.params.id, updateData);
            res.json({ success: true, data: review });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete a review by ID.
     * Tests:
     * - Invalid ID (400).
     * - Non-existent review (404).
     * - Success (204 or 200).
     */
    async deleteReviewById(req: Request, res: Response, next: NextFunction): Promise<void> {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ServiceError('Validation failed', 400, errors.array()));
        }

        try {
            const result = await this.reviewService.deleteReviewById(req.params.id);
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}
