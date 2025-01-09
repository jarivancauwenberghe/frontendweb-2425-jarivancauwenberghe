"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovieController = void 0;
const movieService_1 = require("../services/movieService");
const serviceError_1 = require("../core/serviceError");
const validationMiddleware_1 = require("../core/validationMiddleware");
const express_validator_1 = require("express-validator");
class MovieController {
    static async getMovies(req, res) {
        try {
            const movies = await movieService_1.MovieService.getAllMovies();
            res.status(200).json(movies);
        }
        catch (err) {
            serviceError_1.ServiceError.handleError(err, res);
        }
    }
    static async getMovieById(req, res) {
        try {
            const movie = await movieService_1.MovieService.getMovieById(req.params.id);
            res.status(200).json(movie);
        }
        catch (err) {
            serviceError_1.ServiceError.handleError(err, res);
        }
    }
    static async createMovie(req, res) {
        (0, validationMiddleware_1.validationMiddleware)([
            (0, express_validator_1.body)('title').notEmpty().withMessage('Title is required').isLength({ min: 1, max: 255 }).withMessage('Title must be between 1 and 255 characters'),
            (0, express_validator_1.body)('description').notEmpty().withMessage('Description is required'),
            (0, express_validator_1.body)('director').notEmpty().withMessage('Director is required'),
        ])(req, res, async () => {
            try {
                const movie = await movieService_1.MovieService.createMovie(req.body);
                res.status(201).json(movie);
            }
            catch (err) {
                serviceError_1.ServiceError.handleError(err, res);
            }
        });
    }
    static async updateMovieById(req, res) {
        (0, validationMiddleware_1.validationMiddleware)([
            (0, express_validator_1.body)('title').notEmpty().withMessage('Title is required').isLength({ min: 1, max: 255 }).withMessage('Title must be between 1 and 255 characters'),
            (0, express_validator_1.body)('description').notEmpty().withMessage('Description is required'),
            (0, express_validator_1.body)('director').notEmpty().withMessage('Director is required'),
        ])(req, res, async () => {
            try {
                const movie = await movieService_1.MovieService.updateMovieById(req.params.id, req.body);
                res.status(200).json(movie);
            }
            catch (err) {
                serviceError_1.ServiceError.handleError(err, res);
            }
        });
    }
    static async deleteMovieById(req, res) {
        try {
            await movieService_1.MovieService.deleteMovieById(req.params.id);
            res.status(204).send();
        }
        catch (err) {
            serviceError_1.ServiceError.handleError(err, res);
        }
    }
}
exports.MovieController = MovieController;
