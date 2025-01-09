"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewController = void 0;
const reviewService_1 = require("../services/reviewService");
const serviceError_1 = require("../core/serviceError");
const validationMiddleware_1 = require("../core/validationMiddleware");
const express_validator_1 = require("express-validator");
class ReviewController {
    static async getReviews(req, res) {
        try {
            const reviews = await reviewService_1.ReviewService.getAllReviews();
            res.status(200).json(reviews);
        }
        catch (err) {
            serviceError_1.ServiceError.handleError(err, res);
        }
    }
    static async getReviewById(req, res) {
        try {
            const review = await reviewService_1.ReviewService.getReviewById(req.params.id);
            res.status(200).json(review);
        }
        catch (err) {
            serviceError_1.ServiceError.handleError(err, res);
        }
    }
    static async createReview(req, res) {
        (0, validationMiddleware_1.validationMiddleware)([
            (0, express_validator_1.body)('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
            (0, express_validator_1.body)('comment').notEmpty().withMessage('Comment is required')
        ])(req, res, async () => {
            try {
                const review = await reviewService_1.ReviewService.createReview(req.body);
                res.status(201).json(review);
            }
            catch (err) {
                serviceError_1.ServiceError.handleError(err, res);
            }
        });
    }
    static async updateReviewById(req, res) {
        (0, validationMiddleware_1.validationMiddleware)([
            (0, express_validator_1.body)('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
            (0, express_validator_1.body)('comment').optional().notEmpty().withMessage('Comment is required')
        ])(req, res, async () => {
            try {
                const review = await reviewService_1.ReviewService.updateReviewById(req.params.id, req.body);
                res.status(200).json(review);
            }
            catch (err) {
                serviceError_1.ServiceError.handleError(err, res);
            }
        });
    }
    static async deleteReviewById(req, res) {
        try {
            await reviewService_1.ReviewService.deleteReviewById(req.params.id);
            res.status(204).send();
        }
        catch (err) {
            serviceError_1.ServiceError.handleError(err, res);
        }
    }
}
exports.ReviewController = ReviewController;
