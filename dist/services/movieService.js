"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovieService = void 0;
const movie_1 = require("../entity/movie");
const data_source_1 = require("../data/data-source");
const serviceError_1 = require("../core/serviceError");
const movieRepository = data_source_1.dataSource.getRepository(movie_1.Movie);
class MovieService {
    static async getAllMovies() {
        return await movieRepository.find();
    }
    static async getMovieById(id) {
        const movie = await movieRepository.findOneBy({ id: parseInt(id) });
        if (!movie) {
            throw serviceError_1.ServiceError.notFound('Movie not found');
        }
        return movie;
    }
    static async createMovie(movieData) {
        if (!movieData.title || !movieData.description || !movieData.director) {
            throw serviceError_1.ServiceError.validationFailed('Movie data is incomplete');
        }
        const movie = movieRepository.create(movieData);
        return await movieRepository.save(movie);
    }
    static async updateMovieById(id, movieData) {
        const movie = await this.getMovieById(id);
        if (!movie) {
            throw serviceError_1.ServiceError.notFound('Movie not found');
        }
        if (movieData.title === undefined && movieData.description === undefined && movieData.director === undefined) {
            throw serviceError_1.ServiceError.validationFailed('No movie data to update');
        }
        Object.assign(movie, movieData);
        return await movieRepository.save(movie);
    }
    static async deleteMovieById(id) {
        const movie = await this.getMovieById(id);
        if (!movie) {
            throw serviceError_1.ServiceError.notFound('Movie not found');
        }
        await movieRepository.remove(movie);
        return true;
    }
}
exports.MovieService = MovieService;
