import { Request, Response, NextFunction } from 'express';
import { WatchlistService } from '../services/watchlistService';
import { AppDataSource } from '../data/data-source';
import { Watchlist } from '../entity/watchlist';
import { validationResult } from 'express-validator';
import { ServiceError } from '../core/serviceError';
import { CreateWatchlistDTO } from '../dto/createWatchlistDTO';
import { User } from '../entity/user';
import { Movie } from '../entity/movie';

export class WatchlistController {
    private watchlistService: WatchlistService;

    constructor() {
        const watchlistRepo = AppDataSource.getRepository(Watchlist);
        const userRepo = AppDataSource.getRepository(User);
        const movieRepo = AppDataSource.getRepository(Movie);
        this.watchlistService = new WatchlistService(watchlistRepo, userRepo, movieRepo);
    }

    /**
     * Get all watchlists.
     * Tests:
     * - Authorization: user required.
     * - Success (200).
     * - Mock error (500).
     */
    async getAllWatchlists(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const watchlists = await this.watchlistService.getAllWatchlists();
            res.json({ success: true, data: watchlists });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get watchlist by ID.
     * Tests:
     * - Authorization: user required.
     * - Invalid ID (400).
     * - Non-existent watchlist (404).
     * - Success (200).
     */
    async getWatchlistById(req: Request, res: Response, next: NextFunction): Promise<void> {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ServiceError('Validation failed', 400, errors.array()));
        }

        try {
            const watchlist = await this.watchlistService.getWatchlistById(req.params.id);
            res.json({ success: true, data: watchlist });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create a new watchlist.
     * Tests:
     * - Authorization: user required.
     * - Missing userId/name (400).
     * - Non-existent user/movie (404).
     * - Success (201).
     */
    async createWatchlist(req: Request, res: Response, next: NextFunction): Promise<void> {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ServiceError('Validation failed', 400, errors.array()));
        }

        try {
            const dto: CreateWatchlistDTO = {
                userId: req.body.userId,
                name: req.body.name,
                movieIds: req.body.movieIds,
            };
            const watchlist = await this.watchlistService.createWatchlist(dto);
            res.status(201).json({ success: true, data: watchlist });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update a watchlist by ID.
     * Tests:
     * - Authorization: user required.
     * - Invalid ID (400).
     * - Non-existent watchlist (404).
     * - Non-existent user/movie if provided (404).
     * - Success (200).
     */
    async updateWatchlistById(req: Request, res: Response, next: NextFunction): Promise<void> {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ServiceError('Validation failed', 400, errors.array()));
        }

        try {
            const { userId, name, movieIds } = req.body;
            const updateData: Partial<Watchlist> = {};

            if (userId !== undefined) updateData.user = { id: userId } as User;
            if (name !== undefined) updateData.name = name;
            if (movieIds !== undefined) {
                updateData.movies = movieIds.map((id: number) => ({ id } as Movie));
            }

            const watchlist = await this.watchlistService.updateWatchlistById(req.params.id, updateData);
            res.json({ success: true, data: watchlist });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete a watchlist by ID.
     * Tests:
     * - Authorization: user required.
     * - Invalid ID (400).
     * - Non-existent watchlist (404).
     * - Success (200).
     */
    async deleteWatchlistById(req: Request, res: Response, next: NextFunction): Promise<void> {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ServiceError('Validation failed', 400, errors.array()));
        }

        try {
            const result = await this.watchlistService.deleteWatchlistById(req.params.id);
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}
