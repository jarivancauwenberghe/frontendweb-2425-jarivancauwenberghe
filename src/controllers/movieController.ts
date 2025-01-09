import { Request, Response, NextFunction } from 'express';
import { MovieService } from '../services/movieService';
import { AppDataSource } from '../data/data-source';
import { Movie } from '../entity/movie';
import { validationResult } from 'express-validator';
import { ServiceError } from '../core/serviceError';
import { CreateMovieDTO } from '../dto/createMovieDTO';

export class MovieController {
    private movieService: MovieService;

    constructor() {
        const movieRepo = AppDataSource.getRepository(Movie);
        this.movieService = new MovieService(movieRepo);
    }

    /**
     * Get all movies.
     * Tests:
     * - Ensure all movies are returned (200).
     * - Mock repository errors to test 500 scenario.
     */
    async getAllMovies(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const movies = await this.movieService.getAllMovies();
            res.json({ success: true, data: movies });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get a specific movie by ID.
     * Tests:
     * - Invalid ID (non-integer) leads to validation error (400).
     * - Non-existent movie leads to 404.
     */
    async getMovieById(req: Request, res: Response, next: NextFunction): Promise<void> {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ServiceError('Validation failed', 400, errors.array()));
        }

        try {
            const movie = await this.movieService.getMovieById(req.params.id);
            res.json({ success: true, data: movie });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create a new movie.
     * Tests:
     * - Missing title/description/director results in validation error (400).
     * - Duplicate movie title results in 400 from the service.
     * - Success returns 201.
     */
    async createMovie(req: Request, res: Response, next: NextFunction): Promise<void> {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ServiceError('Validation failed', 400, errors.array()));
        }

        try {
            const dto: CreateMovieDTO = {
                title: req.body.title,
                description: req.body.description,
                director: req.body.director,
            };
            const movie = await this.movieService.createMovie(dto);
            res.status(201).json({ success: true, data: movie });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update a movie by ID.
     * Tests:
     * - Invalid ID (validation fails).
     * - Non-existent movie (404 from service).
     * - Duplicate title (400 from service).
     * - Successful update (200).
     */
    async updateMovieById(req: Request, res: Response, next: NextFunction): Promise<void> {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ServiceError('Validation failed', 400, errors.array()));
        }

        try {
            const { title, description, director } = req.body;
            const updateData: Partial<Movie> = {};
            if (title !== undefined) updateData.title = title;
            if (description !== undefined) updateData.description = description;
            if (director !== undefined) updateData.director = director;

            const movie = await this.movieService.updateMovieById(req.params.id, updateData);
            res.json({ success: true, data: movie });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete a movie by ID.
     * Tests:
     * - Invalid ID (400).
     * - Non-existent movie (404).
     * - Successful delete (200).
     */
    async deleteMovieById(req: Request, res: Response, next: NextFunction): Promise<void> {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ServiceError('Validation failed', 400, errors.array()));
        }

        try {
            const result = await this.movieService.deleteMovieById(req.params.id);
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}
