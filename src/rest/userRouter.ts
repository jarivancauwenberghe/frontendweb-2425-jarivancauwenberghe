import { Router, Request, Response, NextFunction } from 'express';
import { UserController } from '../controllers/userController';
import { authorize } from '../core/authorization';
import { body, param } from 'express-validator';
import { handleValidationErrors } from '../core/validationMiddleware';

const router = Router();
const userController = new UserController();

// Validatie middlewares
const validateUserId = [
    param('id').isInt().withMessage('User ID must be an integer'),
];

const validateUserCreation = [
    body('username')
        .isString().withMessage('Username must be a string')
        .notEmpty().withMessage('Username is required'),
    body('password')
        .isString().withMessage('Password must be a string')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isString().withMessage('Role must be a string'),
];

const validateUserUpdate = [
    body('username').optional().isString().withMessage('Username must be a string'),
    body('password')
        .optional()
        .isString().withMessage('Password must be a string')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isString().withMessage('Role must be a string'),
];

// Routes

/**
 * Tests:
 * - Authorization: Must have 'admin' role.
 * - Invalid input (400).
 * - Non-existent user (404).
 * - Successful CRUD.
 */

/**
 * @route   GET /users
 * @desc    Haal alle gebruikers op
 * @access  Beveiligd (admin)
 */
router.get('/', authorize('admin'), (req: Request, res: Response, next: NextFunction) => userController.getAllUsers(req, res, next));

/**
 * @route   GET /users/:id
 * @desc    Haal een specifieke gebruiker op basis van ID
 * @access  Beveiligd (admin)
 */
router.get('/:id', authorize('admin'), validateUserId, handleValidationErrors, (req: Request, res: Response, next: NextFunction) => userController.getUserById(req, res, next));

/**
 * @route   POST /users
 * @desc    Maak een nieuwe gebruiker aan
 * @access  Beveiligd (admin)
 */
router.post('/', authorize('admin'), validateUserCreation, handleValidationErrors, (req: Request, res: Response, next: NextFunction) => userController.createUser(req, res, next));

/**
 * @route   PUT /users/:id
 * @desc    Werk een gebruiker bij op basis van ID
 * @access  Beveiligd (admin)
 */
router.put('/:id', authorize('admin'), validateUserId, validateUserUpdate, handleValidationErrors, (req: Request, res: Response, next: NextFunction) => userController.updateUserById(req, res, next));

/**
 * @route   DELETE /users/:id
 * @desc    Verwijder een gebruiker op basis van ID
 * @access  Beveiligd (admin)
 */
router.delete('/:id', authorize('admin'), validateUserId, handleValidationErrors, (req: Request, res: Response, next: NextFunction) => userController.deleteUserById(req, res, next));

export default router;
