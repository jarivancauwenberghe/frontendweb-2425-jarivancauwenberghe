"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const review_1 = require("../entity/review");
const data_source_1 = require("../data/data-source");
const serviceError_1 = require("../core/serviceError");
const reviewRepository = data_source_1.dataSource.getRepository(review_1.Review);
class ReviewService {
    static async getAllReviews() {
        return await reviewRepository.find();
    }
    static async getReviewById(id) {
        const review = await reviewRepository.findOneBy({ id: parseInt(id) });
        if (!review) {
            throw serviceError_1.ServiceError.notFound('Review not found');
        }
        return review;
    }
    static async createReview(reviewData) {
        if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
            throw serviceError_1.ServiceError.validationFailed('Rating must be between 1 and 5');
        }
        if (!reviewData.comment || !reviewData.movie || !reviewData.user) {
            throw serviceError_1.ServiceError.validationFailed('Review data is incomplete');
        }
        const review = reviewRepository.create(reviewData);
        return await reviewRepository.save(review);
    }
    static async updateReviewById(id, reviewData) {
        const review = await this.getReviewById(id);
        if (!review) {
            throw serviceError_1.ServiceError.notFound('Review not found');
        }
        if (reviewData.rating !== undefined && (reviewData.rating < 1 || reviewData.rating > 5)) {
            throw serviceError_1.ServiceError.validationFailed('Rating must be between 1 and 5');
        }
        Object.assign(review, reviewData);
        return await reviewRepository.save(review);
    }
    static async deleteReviewById(id) {
        const review = await this.getReviewById(id);
        if (!review) {
            throw serviceError_1.ServiceError.notFound('Review not found');
        }
        await reviewRepository.remove(review);
        return true;
    }
}
exports.ReviewService = ReviewService;
