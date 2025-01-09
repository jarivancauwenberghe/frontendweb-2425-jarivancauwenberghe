import { Router, Request, Response, NextFunction } from 'express';
import { MovieController } from '../controllers/movieController';
import { authorize } from '../core/authorization';
import { body, param } from 'express-validator';
import { handleValidationErrors } from '../core/validationMiddleware';

const router = Router();
const movieController = new MovieController();

// Validation middlewares
const validateMovieId = [
    param('id').isInt().withMessage('Movie ID must be an integer'),
];

const validateMovieCreation = [
    body('title').isString().notEmpty().withMessage('Title is required'),
    body('description').isString().notEmpty().withMessage('Description is required'),
    body('director').isString().notEmpty().withMessage('Director is required'),
];

const validateMovieUpdate = [
    body('title').optional().isString().withMessage('Title must be a string'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('director').optional().isString().withMessage('Director must be a string'),
];

// Routes
/**
 * @route GET /movies
 * @access Requires 'user' role
 * Tests:
 * - No token (401), invalid token (401).
 * - No 'user' role (403 if roles differ).
 * - With valid user token, returns list of movies (200).
 */
router.get('/', authorize('user'), (req: Request, res: Response, next: NextFunction) => movieController.getAllMovies(req, res, next));

/**
 * @route GET /movies/:id
 * @access Requires 'user' role
 */
router.get('/:id', authorize('user'), validateMovieId, handleValidationErrors, (req: Request, res: Response, next: NextFunction) => movieController.getMovieById(req, res, next));

/**
 * @route POST /movies
 * @access Requires 'admin' role
 * Tests:
 * - Token with 'user' role only (403).
 * - Missing fields (400).
 * - Valid admin token and data (201).
 */
router.post('/', authorize('admin'), validateMovieCreation, handleValidationErrors, (req: Request, res: Response, next: NextFunction) => movieController.createMovie(req, res, next));

/**
 * @route PUT /movies/:id
 * @access Requires 'admin' role
 */
router.put('/:id', authorize('admin'), validateMovieId, validateMovieUpdate, handleValidationErrors, (req: Request, res: Response, next: NextFunction) => movieController.updateMovieById(req, res, next));

/**
 * @route DELETE /movies/:id
 * @access Requires 'admin' role
 */
router.delete('/:id', authorize('admin'), validateMovieId, handleValidationErrors, (req: Request, res: Response, next: NextFunction) => movieController.deleteMovieById(req, res, next));

export default router;
