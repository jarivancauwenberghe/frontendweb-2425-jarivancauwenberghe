import { Request, Response, NextFunction } from 'express';
import { RecommendationService } from '../services/recommendationService';
import { AppDataSource } from '../data/data-source';
import { Recommendation } from '../entity/recommendation';
import { validationResult } from 'express-validator';
import { ServiceError } from '../core/serviceError';
import { CreateRecommendationDTO } from '../dto/createRecommendationDTO';
import { User } from '../entity/user';
import { Movie } from '../entity/movie';

export class RecommendationController {
    private recommendationService: RecommendationService;

    constructor() {
        const recommendationRepo = AppDataSource.getRepository(Recommendation);
        const userRepo = AppDataSource.getRepository(User);
        const movieRepo = AppDataSource.getRepository(Movie);
        this.recommendationService = new RecommendationService(recommendationRepo, userRepo, movieRepo);
    }

    /**
     * Get all recommendations.
     * Tests:
     * - Authorization: user required.
     * - Success (200).
     * - Mock error (500).
     */
    async getAllRecommendations(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const recommendations = await this.recommendationService.getAllRecommendations();
            res.json({ success: true, data: recommendations });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get recommendation by ID.
     * Tests:
     * - Authorization: user required.
     * - Invalid ID (400).
     * - Non-existent recommendation (404).
     * - Success (200).
     */
    async getRecommendationById(req: Request, res: Response, next: NextFunction): Promise<void> {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ServiceError('Validation failed', 400, errors.array()));
        }

        try {
            const recommendation = await this.recommendationService.getRecommendationById(req.params.id);
            res.json({ success: true, data: recommendation });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create a new recommendation.
     * Tests:
     * - Authorization: user required.
     * - Missing fields (400).
     * - Non-existent user/movie (404).
     * - Duplicate recommendation (400).
     * - Success (201).
     */
    async createRecommendation(req: Request, res: Response, next: NextFunction): Promise<void> {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ServiceError('Validation failed', 400, errors.array()));
        }

        try {
            const dto: CreateRecommendationDTO = {
                movieId: req.body.movieId,
                userId: req.body.userId,
                reason: req.body.reason,
            };
            const recommendation = await this.recommendationService.createRecommendation(dto);
            res.status(201).json({ success: true, data: recommendation });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update a recommendation by ID.
     * Tests:
     * - Authorization: user required.
     * - Invalid ID (400).
     * - Non-existent recommendation (404).
     * - Empty reason (400).
     * - Non-existent user/movie if IDs provided (404).
     * - Success (200).
     */
    async updateRecommendationById(req: Request, res: Response, next: NextFunction): Promise<void> {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ServiceError('Validation failed', 400, errors.array()));
        }

        try {
            const { movieId, userId, reason } = req.body;
            const updateData: Partial<Recommendation> = {};
            if (movieId !== undefined) updateData.movie = { id: movieId } as Movie;
            if (userId !== undefined) updateData.user = { id: userId } as User;
            if (reason !== undefined) updateData.reason = reason;

            const recommendation = await this.recommendationService.updateRecommendationById(req.params.id, updateData);
            res.json({ success: true, data: recommendation });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete a recommendation by ID.
     * Tests:
     * - Authorization: user required.
     * - Invalid ID (400).
     * - Non-existent recommendation (404).
     * - Success (200).
     */
    async deleteRecommendationById(req: Request, res: Response, next: NextFunction): Promise<void> {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ServiceError('Validation failed', 400, errors.array()));
        }

        try {
            const result = await this.recommendationService.deleteRecommendationById(req.params.id);
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}
