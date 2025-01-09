import { Router, Request, Response, NextFunction } from 'express';
import { ReviewController } from '../controllers/reviewController';
import { authorize } from '../core/authorization';
import { body, param } from 'express-validator';
import { handleValidationErrors } from '../core/validationMiddleware';

const router = Router();
const reviewController = new ReviewController();

// Validation middlewares
const validateReviewId = [
    param('id').isInt().withMessage('Review ID must be an integer'),
];

const validateReviewCreation = [
    body('movieId').isInt().withMessage('Valid movie ID is required'),
    body('userId').isInt().withMessage('Valid user ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
    body('comment').isString().notEmpty().withMessage('Comment is required'),
];

const validateReviewUpdate = [
    body('movieId').optional().isInt().withMessage('Valid movie ID is required'),
    body('userId').optional().isInt().withMessage('Valid user ID is required'),
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
    body('comment').optional().isString().withMessage('Comment must be a string'),
];

// Routes
/**
 * @route GET /reviews
 * @access user
 * Tests:
 * - No token (401), invalid token (401).
 * - Non-'user' role token (403).
 * - With user token, returns reviews (200).
 */
router.get('/', authorize('user'), (req: Request, res: Response, next: NextFunction) => reviewController.getAllReviews(req, res, next));

/**
 * @route GET /reviews/:id
 * @access user
 */
router.get('/:id', authorize('user'), validateReviewId, handleValidationErrors, (req: Request, res: Response, next: NextFunction) => reviewController.getReviewById(req, res, next));

/**
 * @route POST /reviews
 * @access user
 */
router.post('/', authorize('user'), validateReviewCreation, handleValidationErrors, (req: Request, res: Response, next: NextFunction) => reviewController.createReview(req, res, next));

/**
 * @route PUT /reviews/:id
 * @access user
 */
router.put('/:id', authorize('user'), validateReviewId, validateReviewUpdate, handleValidationErrors, (req: Request, res: Response, next: NextFunction) => reviewController.updateReviewById(req, res, next));

/**
 * @route DELETE /reviews/:id
 * @access user
 */
router.delete('/:id', authorize('user'), validateReviewId, handleValidationErrors, (req: Request, res: Response, next: NextFunction) => reviewController.deleteReviewById(req, res, next));

export default router;
