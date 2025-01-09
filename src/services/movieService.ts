import { Repository } from 'typeorm';
import { Movie } from '../entity/movie';
import { ServiceError } from '../core/serviceError';
import logger from '../core/logger';
import { CreateMovieDTO } from '../dto/createMovieDTO';
import { UpdateMovieDTO } from '../dto/updateMovieDTO';

export class MovieService {
    private movieRepo: Repository<Movie>;

    constructor(movieRepo: Repository<Movie>) {
        this.movieRepo = movieRepo;
    }

    /**
     * Fetch all movies.
     * Tests:
     * - Successful fetch (expect 200).
     * - Mocked repository error (expect 500).
     */
    async getAllMovies(): Promise<Movie[]> {
        try {
            const movies = await this.movieRepo.find({ relations: ['reviews', 'watchlists', 'recommendations'] });
            return movies;
        } catch (error) {
            logger.error('Failed to get all movies', { error });
            throw new ServiceError('Unable to fetch movies at this time.', 500);
        }
    }

    /**
     * Fetch a movie by ID.
     * @param id - The ID of the movie.
     * Tests:
     * - Non-numeric ID (expect 400).
     * - Non-existent movie (expect 404).
     * - Mocked repository error (expect 500).
     */
    async getMovieById(id: string): Promise<Movie> {
        const movieId = Number(id);
        if (!id || isNaN(movieId)) {
            throw new ServiceError('Invalid movie ID provided', 400);
        }

        try {
            const movie = await this.movieRepo.findOne({
                where: { id: movieId },
                relations: ['reviews', 'watchlists', 'recommendations'],
            });

            if (!movie) {
                throw new ServiceError('Movie not found', 404);
            }

            return movie;
        } catch (error) {
            logger.error(`Failed to get movie with ID: ${id}`, { error });
            if (error instanceof ServiceError) throw error;
            throw new ServiceError('Unable to fetch movie at this time. Please try again later.', 500);
        }
    }

    /**
     * Create a new movie.
     * @param dto - The data for the new movie.
     * Tests:
     * - Missing required fields (expect 400).
     * - Duplicate title (expect 400).
     * - Mocked repository error (expect 500).
     */
    async createMovie(dto: CreateMovieDTO): Promise<Movie> {
        const { title, description, director } = dto;
        if (!title || !description || !director) {
            throw new ServiceError('Title, Description, and Director are required', 400);
        }

        try {
            const existingMovie = await this.movieRepo.findOneBy({ title });
            if (existingMovie) {
                throw new ServiceError('Movie with this title already exists', 400);
            }

            const movie = this.movieRepo.create({ title, description, director });
            const savedMovie = await this.movieRepo.save(movie);
            logger.info(`Created new movie with ID: ${savedMovie.id}`);
            return savedMovie;
        } catch (error) {
            logger.error('Failed to create a new movie', { error });
            if (error instanceof ServiceError) throw error;
            throw new ServiceError('Unable to create movie at this time. Please try again later.', 500);
        }
    }

    /**
     * Update a movie by ID.
     * @param id - The ID of the movie.
     * @param dto - The update data.
     * Tests:
     * - Invalid ID (expect 400).
     * - Non-existent movie (expect 404).
     * - Duplicate title (expect 400).
     * - Mocked repository error (expect 500).
     */
    async updateMovieById(id: string, dto: UpdateMovieDTO): Promise<Movie> {
        const movieId = Number(id);
        if (!id || isNaN(movieId)) {
            throw new ServiceError('Invalid movie ID provided', 400);
        }

        try {
            const movie = await this.getMovieById(id);

            if (dto.title) {
                const existingMovie = await this.movieRepo.findOneBy({ title: dto.title });
                if (existingMovie && existingMovie.id !== movie.id) {
                    throw new ServiceError('Movie with this title already exists', 400);
                }
                movie.title = dto.title;
            }

            if (dto.description !== undefined) {
                movie.description = dto.description;
            }

            if (dto.director !== undefined) {
                movie.director = dto.director;
            }

            const updatedMovie = await this.movieRepo.save(movie);
            logger.info(`Updated movie with ID: ${updatedMovie.id}`);
            return updatedMovie;
        } catch (error) {
            logger.error(`Failed to update movie with ID: ${id}`, { error });
            if (error instanceof ServiceError) throw error;
            throw new ServiceError('Unable to update movie at this time. Please try again later.', 500);
        }
    }

    /**
     * Delete a movie by ID.
     * @param id - The ID of the movie.
     * Tests:
     * - Invalid ID (expect 400).
     * - Non-existent movie (expect 404).
     * - Mocked repository error (expect 500).
     */
    async deleteMovieById(id: string): Promise<{ message: string }> {
        const movieId = Number(id);
        if (!id || isNaN(movieId)) {
            throw new ServiceError('Invalid movie ID provided', 400);
        }

        try {
            const movie = await this.getMovieById(id);
            await this.movieRepo.remove(movie);
            logger.info(`Deleted movie with ID: ${id}`);
            return { message: 'Movie deleted successfully' };
        } catch (error) {
            logger.error(`Failed to delete movie with ID: ${id}`, { error });
            if (error instanceof ServiceError) throw error;
            throw new ServiceError('Unable to delete movie at this time. Please try again later.', 500);
        }
    }
}
