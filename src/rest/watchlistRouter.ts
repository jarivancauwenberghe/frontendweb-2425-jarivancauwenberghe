import { Router, Request, Response, NextFunction } from 'express';
import { WatchlistController } from '../controllers/watchlistController';
import { authorize } from '../core/authorization';
import { body, param } from 'express-validator';
import { handleValidationErrors } from '../core/validationMiddleware';

const router = Router();
const watchlistController = new WatchlistController();

// Validatie middlewares
const validateWatchlistId = [
    param('id').isInt().withMessage('Watchlist ID must be an integer'),
];

const validateWatchlistCreation = [
    body('userId').isInt().withMessage('Valid user ID is required'),
    body('name').isString().withMessage('Name must be a string').notEmpty().withMessage('Name is required'),
    body('movieIds').optional().isArray().withMessage('movieIds must be an array of integers'),
    body('movieIds.*').isInt().withMessage('Each movieId must be an integer'),
];

const validateWatchlistUpdate = [
    body('userId').optional().isInt().withMessage('Valid user ID is required'),
    body('name').optional().isString().withMessage('Name must be a string'),
    body('movieIds').optional().isArray().withMessage('movieIds must be an array of integers'),
    body('movieIds.*').isInt().withMessage('Each movieId must be an integer'),
];

// Routes

/**
 * Tests:
 * - Authorization: 'user' role required.
 * - Invalid input (400).
 * - Non-existent watchlist (404).
 * - Successful CRUD.
 */

/**
 * @route   GET /watchlists
 * @desc    Haal alle watchlists op
 * @access  Beveiligd (gebruiker)
 */
router.get('/', authorize('user'), (req: Request, res: Response, next: NextFunction) => watchlistController.getAllWatchlists(req, res, next));

/**
 * @route   GET /watchlists/:id
 * @desc    Haal een specifieke watchlist op basis van ID
 * @access  Beveiligd (gebruiker)
 */
router.get('/:id', authorize('user'), validateWatchlistId, handleValidationErrors, (req: Request, res: Response, next: NextFunction) => watchlistController.getWatchlistById(req, res, next));

/**
 * @route   POST /watchlists
 * @desc    Maak een nieuwe watchlist aan
 * @access  Beveiligd (gebruiker)
 */
router.post('/', authorize('user'), validateWatchlistCreation, handleValidationErrors, (req: Request, res: Response, next: NextFunction) => watchlistController.createWatchlist(req, res, next));

/**
 * @route   PUT /watchlists/:id
 * @desc    Werk een watchlist bij op basis van ID
 * @access  Beveiligd (gebruiker)
 */
router.put('/:id', authorize('user'), validateWatchlistId, validateWatchlistUpdate, handleValidationErrors, (req: Request, res: Response, next: NextFunction) => watchlistController.updateWatchlistById(req, res, next));

/**
 * @route   DELETE /watchlists/:id
 * @desc    Verwijder een watchlist op basis van ID
 * @access  Beveiligd (gebruiker)
 */
router.delete('/:id', authorize('user'), validateWatchlistId, handleValidationErrors, (req: Request, res: Response, next: NextFunction) => watchlistController.deleteWatchlistById(req, res, next));

export default router;
