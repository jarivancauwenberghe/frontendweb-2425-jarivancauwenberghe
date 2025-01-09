import { Router, Request, Response, NextFunction } from 'express';
import { RecommendationController } from '../controllers/recommendationController';
import { authorize } from '../core/authorization';
import { body, param } from 'express-validator';
import { handleValidationErrors } from '../core/validationMiddleware';

const router = Router();
const recommendationController = new RecommendationController();

// Validatie middlewares
const validateRecommendationId = [
    param('id').isInt().withMessage('Recommendation ID must be an integer'),
];

const validateRecommendationCreation = [
    body('movieId').isInt().withMessage('Valid movie ID is required'),
    body('userId').isInt().withMessage('Valid user ID is required'),
    body('reason').isString().withMessage('Reason must be a string').notEmpty().withMessage('Reason is required'),
];

const validateRecommendationUpdate = [
    body('movieId').optional().isInt().withMessage('Valid movie ID is required'),
    body('userId').optional().isInt().withMessage('Valid user ID is required'),
    body('reason').optional().isString().withMessage('Reason must be a string'),
];

// Routes

/**
 * Tests:
 * - Authorization: Must have 'user' role.
 * - Invalid input (400) for creation/update.
 * - Non-existent resource (404).
 * - Successfully handle CRUD operations.
 */

/**
 * @route   GET /recommendations
 * @desc    Haal alle aanbevelingen op
 * @access  Beveiligd (gebruiker)
 */
router.get('/', authorize('user'), (req: Request, res: Response, next: NextFunction) => recommendationController.getAllRecommendations(req, res, next));

/**
 * @route   GET /recommendations/:id
 * @desc    Haal een specifieke aanbeveling op basis van ID
 * @access  Beveiligd (gebruiker)
 */
router.get('/:id', authorize('user'), validateRecommendationId, handleValidationErrors, (req: Request, res: Response, next: NextFunction) => recommendationController.getRecommendationById(req, res, next));

/**
 * @route   POST /recommendations
 * @desc    Maak een nieuwe aanbeveling aan
 * @access  Beveiligd (gebruiker)
 */
router.post('/', authorize('user'), validateRecommendationCreation, handleValidationErrors, (req: Request, res: Response, next: NextFunction) => recommendationController.createRecommendation(req, res, next));

/**
 * @route   PUT /recommendations/:id
 * @desc    Werk een aanbeveling bij op basis van ID
 * @access  Beveiligd (gebruiker)
 */
router.put('/:id', authorize('user'), validateRecommendationId, validateRecommendationUpdate, handleValidationErrors, (req: Request, res: Response, next: NextFunction) => recommendationController.updateRecommendationById(req, res, next));

/**
 * @route   DELETE /recommendations/:id
 * @desc    Verwijder een aanbeveling op basis van ID
 * @access  Beveiligd (gebruiker)
 */
router.delete('/:id', authorize('user'), validateRecommendationId, handleValidationErrors, (req: Request, res: Response, next: NextFunction) => recommendationController.deleteRecommendationById(req, res, next));

export default router;
