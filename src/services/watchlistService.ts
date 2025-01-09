import { Repository } from 'typeorm';
import { Watchlist } from '../entity/watchlist';
import { User } from '../entity/user';
import { Movie } from '../entity/movie';
import { ServiceError } from '../core/serviceError';
import logger from '../core/logger';
import { CreateWatchlistDTO } from '../dto/createWatchlistDTO';

export class WatchlistService {
    private watchlistRepo: Repository<Watchlist>;
    private userRepo: Repository<User>;
    private movieRepo: Repository<Movie>;

    constructor(
        watchlistRepo: Repository<Watchlist>,
        userRepo: Repository<User>,
        movieRepo: Repository<Movie>
    ) {
        this.watchlistRepo = watchlistRepo;
        this.userRepo = userRepo;
        this.movieRepo = movieRepo;
    }

    /**
     * Fetch all watchlists.
     * Tests:
     * - Successful fetch.
     * - Mock repo error (expect 500).
     */
    async getAllWatchlists(): Promise<Watchlist[]> {
        try {
            return await this.watchlistRepo.find({ relations: ['user', 'movies'] });
        } catch (error) {
            logger.error('Failed to get all watchlists', { error });
            throw new ServiceError('Unable to fetch watchlists at this time.', 500);
        }
    }

    /**
     * Fetch a watchlist by ID.
     * @param id - The watchlist ID.
     * Tests:
     * - Invalid ID (expect 400).
     * - Non-existent watchlist (expect 404).
     * - Mock repo error (expect 500).
     */
    async getWatchlistById(id: string): Promise<Watchlist> {
        if (!id || isNaN(Number(id))) {
            throw new ServiceError('Invalid watchlist ID provided', 400);
        }

        try {
            const watchlist = await this.watchlistRepo.findOne({
                where: { id: Number(id) },
                relations: ['user', 'movies'],
            });

            if (!watchlist) {
                throw new ServiceError('Watchlist not found', 404);
            }

            return watchlist;
        } catch (error) {
            logger.error(`Failed to get watchlist with ID: ${id}`, { error });
            if (error instanceof ServiceError) throw error;
            throw new ServiceError('Unable to fetch watchlist at this time. Please try again later.', 500);
        }
    }

    /**
     * Create a new watchlist.
     * @param dto - The data for the watchlist.
     * Tests:
     * - Missing userId or name (expect 400).
     * - Non-existent user or movies (expect 404).
     * - Mock repo error (expect 500).
     */
    async createWatchlist(dto: CreateWatchlistDTO): Promise<Watchlist> {
        const { userId, movieIds, name } = dto;

        if (!userId || !name) {
            throw new ServiceError('User and Name are required', 400);
        }

        try {
            const user = await this.userRepo.findOneBy({ id: userId });
            if (!user) {
                throw new ServiceError('User not found', 404);
            }

            let movies: Movie[] = [];
            if (movieIds && movieIds.length > 0) {
                movies = await this.movieRepo.findByIds(movieIds);
                if (movies.length !== movieIds.length) {
                    throw new ServiceError('One or more movies not found', 404);
                }
            }

            const watchlist = this.watchlistRepo.create({ user, name, movies });
            const savedWatchlist = await this.watchlistRepo.save(watchlist);
            logger.info(`Created new watchlist with ID: ${savedWatchlist.id}`);
            return savedWatchlist;
        } catch (error) {
            logger.error('Failed to create a new watchlist', { error });
            if (error instanceof ServiceError) throw error;
            throw new ServiceError('Unable to create watchlist at this time. Please try again later.', 500);
        }
    }

    /**
     * Update a watchlist by ID.
     * @param id - The watchlist ID.
     * @param updateData - The update fields.
     * Tests:
     * - Invalid ID (expect 400).
     * - Non-existent watchlist (expect 404).
     * - Non-existent user/movies if provided (expect 404).
     * - Mock repo error (expect 500).
     */
    async updateWatchlistById(id: string, updateData: Partial<Watchlist>): Promise<Watchlist> {
        if (!id || isNaN(Number(id))) {
            throw new ServiceError('Invalid watchlist ID provided', 400);
        }

        try {
            const watchlist = await this.getWatchlistById(id);

            if (updateData.user) {
                const user = await this.userRepo.findOneBy({ id: updateData.user.id });
                if (!user) {
                    throw new ServiceError('User not found', 404);
                }
                updateData.user = user;
            }

            if (updateData.movies) {
                const movieIds = updateData.movies.map(movie => movie.id);
                const movies = await this.movieRepo.findByIds(movieIds);
                if (movies.length !== movieIds.length) {
                    throw new ServiceError('One or more movies not found', 404);
                }
                updateData.movies = movies;
            }

            Object.assign(watchlist, updateData);
            const updatedWatchlist = await this.watchlistRepo.save(watchlist);
            logger.info(`Updated watchlist with ID: ${updatedWatchlist.id}`);
            return updatedWatchlist;
        } catch (error) {
            logger.error(`Failed to update watchlist with ID: ${id}`, { error });
            if (error instanceof ServiceError) throw error;
            throw new ServiceError('Unable to update watchlist at this time. Please try again later.', 500);
        }
    }

    /**
     * Delete a watchlist by ID.
     * @param id - The watchlist ID.
     * Tests:
     * - Invalid ID (expect 400).
     * - Non-existent watchlist (expect 404).
     * - Mock repo error (expect 500).
     */
    async deleteWatchlistById(id: string): Promise<{ message: string }> {
        if (!id || isNaN(Number(id))) {
            throw new ServiceError('Invalid watchlist ID provided', 400);
        }

        try {
            const watchlist = await this.getWatchlistById(id);
            await this.watchlistRepo.remove(watchlist);
            logger.info(`Deleted watchlist with ID: ${id}`);
            return { message: 'Watchlist deleted successfully' };
        } catch (error) {
            logger.error(`Failed to delete watchlist with ID: ${id}`, { error });
            if (error instanceof ServiceError) throw error;
            throw new ServiceError('Unable to delete watchlist at this time. Please try again later.', 500);
        }
    }
}
